# Render deployment checklist

EduSwarm uses an OpenAI-compatible provider through OpenRouter for generation and
local deterministic embeddings for Qdrant. Gemini is not required.

**The LLM key now belongs on two services.** The agent runtime is the preferred
brain (it adds Qdrant retrieval), but it is a separate service that sleeps and
cold-starts. When it cannot answer, the API calls the model directly so
specialist agents keep answering with a real model instead of falling back to
canned guidance. Set `OPENROUTER_API_KEY` on **both** `eduswarm-api` and
`eduswarm-agent`.

## Agent service

The Render service must be named `eduswarm-agent` and use:

```text
Root directory: services/agent-runtime
Build command: pip install -r requirements.txt
Start command: uvicorn app.main:app --host 0.0.0.0 --port 10000
Health check: /ready
```

Set these environment variables on **eduswarm-agent**:

```text
OPENROUTER_API_KEY=<your own OpenRouter key>
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
QDRANT_URL=https://<your-qdrant-cluster-host>
QDRANT_API_KEY=<your-qdrant-key>
QDRANT_COLLECTION=eduswarm_knowledge
EDUSWARM_STATE_DIR=/tmp/eduswarm-state
EDUSWARM_LOCAL_KITS_DIR=/tmp/eduswarm-state/local-kits
```

### Seed the offline study kits

Local kits are the evidence tier between Qdrant and the thin curriculum preview:
attributed tutorial extracts stored on the mounted disk, so a topic stays
teachable when nothing is indexed. Seed them once per deploy (or whenever the
curriculum grows) from a shell on the agent service:

```bash
python seed_knowledge.py --local-kits          # every live topic
python seed_knowledge.py --local-kits --limit 5  # smoke run
```

It fetches only pages whose robots.txt permits it, stores a bounded extract with
its source URL, and skips any topic that cannot reach two independent permitted
sources — those are listed at the end of the run, so you can revisit them as the
remaining source rights land. No kit is ever invented.

### There is nothing to configure

The API key is the only AI setting. Model ids, token budgets, timeouts and retry
counts are all decided by the code: both services discover their model chain
from OpenRouter's live `/models` catalogue (cached 20 minutes), so:

- a free model that is retired simply disappears from the chain;
- an id you pin is used only while it still exists in the catalogue;
- failures are remembered in a cool-down ledger (404 → 6h, 402/403 → 1h,
  429 → 2m, per-day 429 → 3h, empty/invalid output → 15m), so a dead model sinks
  to the back of the chain instead of burning the first attempt of every job;
- the model that last answered successfully is tried first next time.

Old `OPENROUTER_MODEL`, `OPENROUTER_FALLBACK_MODELS`,
`OPENROUTER_STRUCTURED_MAX_TOKENS` and friends left in the Render dashboard are
**harmless** — dead ids are filtered out against the catalogue and the budget
variables are no longer read at all. You can delete them whenever you feel like
tidying up; nothing breaks either way, and a dying free model never needs a
redeploy again.

Optionally set `OPENROUTER_PAID_FALLBACK_MODEL` to **one** cheap paid model. It
is tried only after every free model in the chain has failed, which is the only
way to make lesson generation effectively guaranteed — free tiers never can be.

Keys must be created by the account owner at
[OpenRouter](https://openrouter.ai/); the repository ships none.

For Qdrant Cloud, use the cluster HTTPS URL without `:6333` or a path such as
`/dashboard` or `/collections`. For a self-hosted Qdrant server, include a port
only when that server is publicly reachable from Render.

## API service

```text
AGENT_RUNTIME_URL=https://eduswarm-agent.onrender.com
WEB_URL=https://eduswarm-web.onrender.com
CORS_ORIGINS=https://eduswarm-web.onrender.com
OAUTH_REDIRECT_URI=https://eduswarm-api.onrender.com/auth/google/callback
SESSION_SECRET=<long random value>
GOOGLE_CLIENT_ID=<oauth client>
GOOGLE_CLIENT_SECRET=<oauth secret>
MONGODB_URI=<atlas or render mongo>
REDIS_URL=<render redis>
OPENROUTER_API_KEY=<same key as the agent service>
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

`WEB_URL` matters because it is where the OAuth callback sends the single-use
`loginCode`. If it is wrong, new devices loop on sign-in.

Sign-in is token-based. The web app and the API are on different domains, so the
session cookie is a third-party cookie that Safari, Firefox and Chrome block.
The callback redirects to `WEB_URL/?loginCode=…`, the SPA exchanges it at
`POST /api/auth/exchange` for a 30-day Bearer token, and every later request
sends `Authorization: Bearer …`.

The API and agent are separate services. Redeploy the agent first, then the API.

## Verification

```bash
curl -i https://eduswarm-agent.onrender.com/health
curl -i https://eduswarm-agent.onrender.com/ready
curl -i https://eduswarm-api.onrender.com/ready
curl -s https://eduswarm-api.onrender.com/api/agents/status
```

Expected: HTTP 200 from the first three, `providerConfigured: true` in the agent
health response, and `mode: langgraph-openrouter-qdrant` from `/ready`.

`/health` answers from the cached catalogue only and never waits on OpenRouter,
so Render's health check cannot be slowed down by a provider incident. Its
`models` array shows the first four ids in the current chain — if it lists ids
you never configured, that is the discovery working as intended.

`/api/agents/status` tells you which brain will answer specialists:

```json
{"runtime":{"online":true,"model":""},
 "directLlm":true,"models":["…"],"answerPath":"runtime"}
```

- `answerPath: "runtime"` — best case, retrieval-grounded answers.
- `answerPath: "direct-llm"` — the runtime is down but the API has a key; still
  a real model.
- `answerPath: "curriculum-fallback"` — neither path has a working key. Add
  `OPENROUTER_API_KEY` to the service that is missing it.

Every assistant reply in the UI is labelled with the brain that produced it
(`✦ AI model · <id>` or `⚠ Offline guidance`), so a learner can tell without
reading logs.

After readiness passes, create a new study topic. Existing failed jobs remain
failed and should not be reused.

## Failure diagnosis

If `/ready` returns 503, inspect the agent logs for a missing
`OPENROUTER_API_KEY` or Qdrant connectivity. If `/ready` returns 200 but a topic
fails, inspect the job trace and agent logs for provider HTTP errors such as
401, 402, 429, or 503. A 429/503 from OpenRouter is usually a model quota or
temporary availability issue — the fallback chain handles most of it; if every
model in the chain fails the error text names each one.

When a specialist reply is labelled `⚠ Offline guidance`, the API logs the
reason: look for `[agents] fell back to local guidance:` followed by the runtime
status and every model that was tried.

If a new device keeps bouncing to Google, check `WEB_URL` and `CORS_ORIGINS`,
then confirm `POST /api/auth/exchange` returns 200 with a `token` after a
sign-in. A 401 there means the code was reused or expired — sign in once more.

## Notes on state

Lessons, progress, reviews, mocks, agent sessions, goals, and the active
universe are persisted in Mongo and survive restarts. The Reading Room's
curated blog library is static reference data served from
`apps/api/src/resources.ts`, so it needs no persistence.

Never commit provider keys, Qdrant keys, database credentials, OAuth secrets, or
session secrets.
