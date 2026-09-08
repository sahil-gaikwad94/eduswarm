# EduSwarm

EduSwarm is a multi-agent AI learning platform for GATE CS, Web Development, and AI/ML. This repository contains the first production-minded vertical slice: onboarding, independent goals, a GATE Algorithms curriculum, asynchronous topic jobs, live progress, verified notes, flashcards, quizzes, and PYQ metadata.

## Architecture

- `apps/web`: React + Vite + TypeScript frontend.
- `apps/api`: Express API with Google OAuth, signed HttpOnly sessions, MongoDB persistence, Redis pub/sub for SSE, profile/goals, curriculum, job submission, and owner-scoped content endpoints.
- `services/agent-runtime`: FastAPI LangGraph runtime with checkpointed agent state, Qdrant retrieval, OpenAI-compatible structured generation, local embeddings, and evidence-gated publishing.
- `infra`: Docker Compose and Render Blueprint configuration.

The runtime uses an OpenAI-compatible provider (OpenRouter by default) and Qdrant in production, validates generated artifacts against retrieved evidence, and fails jobs that cannot produce an approved package. Embeddings are computed locally, so retrieval does not depend on a second model API. The API stores users, sessions, and API jobs in MongoDB; Redis provides cross-instance job event delivery. Runtime graph checkpoints use `EDUSWARM_STATE_DIR`, backed by the Render persistent disk and the Compose `runtime-state` volume.

## Local run

1. `cp .env.example .env`
2. `npm install`
3. `npm run dev:api`
4. In another terminal: `npm run dev:web`
5. Open `http://localhost:5173`.

Local development defaults to `AUTH_MODE=demo`. Production requires `AUTH_MODE=google`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OAUTH_REDIRECT_URI`, and `SESSION_SECRET`. Register the callback URL exactly in Google Cloud Console.

## Render deployment

The repository includes `render.yaml`. Create a new Render Blueprint from this repository, provision the managed Redis and Mongo-compatible database offered by your Render account, and set the secret environment variables in the Render dashboard. The API and agent runtime are separate web services; the frontend is a static site. For a managed vector store, set `QDRANT_URL` to the hosted endpoint.

The blueprint uses the default Render URLs `https://eduswarm-web.onrender.com`, `https://eduswarm-api.onrender.com`, and `https://eduswarm-agent.onrender.com`. Change `CORS_ORIGINS`, `VITE_API_URL`, `AGENT_RUNTIME_URL`, `PUBLIC_API_URL`, `WEB_URL`, and `OAUTH_REDIRECT_URI` together if you use custom domains. Production fallback is disabled so runtime outages fail visibly instead of silently switching execution modes. Set the `sync: false` MongoDB, Redis, Google, OpenRouter, and Qdrant values in Render before the first deploy.

The agent runtime uses `OPENROUTER_API_KEY` and the free-tier `meta-llama/llama-3.3-70b-instruct:free` model by default. Create an OpenRouter account and add your own API key in Render; the repository does not include or provide API keys. You can change `OPENROUTER_MODEL` to any model available to your provider. `OPENAI_BASE_URL` remains configurable for another OpenAI-compatible provider.

## Quality gates

`npm test` runs API unit tests. `npm run build` builds both applications. Run the agent runtime tests from its package directory with `cd services/agent-runtime && python -m pytest test_main.py`. The deterministic evaluation fixture lives under `tests/evaluation`.

## Security notes

Generated code is not executed by the API or worker. Any future code runner must be isolated with strict CPU, memory, time, and network limits. Never commit `.env` files or provider credentials.
