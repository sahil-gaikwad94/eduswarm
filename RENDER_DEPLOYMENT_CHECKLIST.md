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
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
OPENROUTER_FALLBACK_MODELS=deepseek/deepseek-chat-v3-0324:free,qwen/qwen-2.5-72b-instruct:free,openrouter/free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
QDRANT_URL=https://<your-qdrant-cluster-host>
QDRANT_API_KEY=<your-qdrant-key>
QDRANT_COLLECTION=eduswarm_knowledge
EDUSWARM_STATE_DIR=/tmp/eduswarm-state
```

`OPENROUTER_MODEL` and `OPENROUTER_FALLBACK_MODELS` are comma-separated chains:
the first model that answers wins. Avoid leaving the model at
`openrouter/free` — that is the auto-router, which hands each request to an
arbitrary free model and is the usual cause of vague specialist answers. Pick a
specific `:free` model from the OpenRouter model list and keep two or three
fallbacks behind it. Keys must be created by the account owner at
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
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
OPENROUTER_FALLBACK_MODELS=deepseek/deepseek-chat-v3-0324:free,qwen/qwen-2.5-72b-instruct:free,openrouter/free
LLM_TIMEOUT_MS=90000
```

`WEB_URL` matters twice over: it is where the OAuth callback sends the
single-use `loginCode`, and it is the root used for club invite links. If it is
wrong, new devices loop on sign-in and invite links point at the wrong host.

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

`/api/agents/status` tells you which brain will answer specialists:

```json
{"runtime":{"online":true,"model":"meta-llama/llama-3.3-70b-instruct:free"},
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

Clubs live in API process memory, so they reset when the API instance restarts
or scales to more than one instance. Lessons, progress, reviews, mocks, agent
sessions, goals, and the active universe are persisted in Mongo and survive
restarts.

Never commit provider keys, Qdrant keys, database credentials, OAuth secrets, or
session secrets.
