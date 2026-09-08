# Render deployment checklist

EduSwarm now uses an OpenAI-compatible provider through OpenRouter for generation and local deterministic embeddings for Qdrant. Gemini is no longer required by the agent runtime.

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
OPENROUTER_MODEL=openrouter/free
OPENAI_BASE_URL=https://openrouter.ai/api/v1
QDRANT_URL=https://<your-qdrant-cluster-host>
QDRANT_API_KEY=<your-qdrant-key>
QDRANT_COLLECTION=eduswarm_knowledge
EDUSWARM_STATE_DIR=/tmp/eduswarm-state
```

OpenRouter API keys must be created by the account owner at [OpenRouter](https://openrouter.ai/). The repository cannot include or provide an API key. Free model availability and limits can change; if the selected model is unavailable, choose another `:free` model from the OpenRouter model list and update `OPENROUTER_MODEL`.

For Qdrant Cloud, use the cluster HTTPS URL without `:6333` or a path such as `/dashboard` or `/collections`. For a self-hosted Qdrant server, include a port only when that server is publicly reachable from Render.

## API service

Set the API service environment variable to the actual agent hostname:

```text
AGENT_RUNTIME_URL=https://eduswarm-agent.onrender.com
```

The API and agent are separate services. Redeploy the agent first, then the API.

## Verification

```bash
curl -i https://eduswarm-agent.onrender.com/health
curl -i https://eduswarm-agent.onrender.com/ready
curl -i https://eduswarm-api.onrender.com/ready
```

Expected responses are HTTP 200 from all three endpoints. The agent health response should report `providerConfigured: true`, and the readiness response should report `mode: langgraph-openrouter-qdrant`.

After readiness passes, create a new study topic. Existing failed jobs remain failed and should not be reused.

## Failure diagnosis

If `/ready` returns 503, inspect the agent logs for missing `OPENROUTER_API_KEY` or Qdrant connectivity. If `/ready` returns 200 but a topic fails, inspect the job trace and agent logs for provider HTTP errors such as 401, 402, 429, or 503. A 429/503 from OpenRouter is usually a model quota or temporary availability issue; switch to another available free model or retry later.

The frontend intentionally displays a generic message for failed jobs. The detailed cause is available from the runtime job endpoint and Render logs.

## Files changed

- `services/agent-runtime/app/rag.py`: OpenAI-compatible generation, retries, JSON parsing, and local embeddings.
- `services/agent-runtime/app/main.py`: provider-neutral health/readiness metadata.
- `services/agent-runtime/requirements.txt`: removed the Gemini SDK.
- `.env.example`: replaced Gemini variables with OpenRouter variables.
- `render.yaml`: configured `eduswarm-agent` with OpenRouter variables.
- `infra/docker-compose.yml`: updated local runtime variables.

Never commit provider keys, Qdrant keys, database credentials, OAuth secrets, or session secrets.
