"""Model-churn regression tests against a fake OpenRouter on localhost.

No network access: a threaded `http.server` plays OpenRouter, so every failure
mode that took the Notes Author down in production (dead slug, empty reasoning
reply, 400 on response_format, fenced/truncated JSON) is reproducible here.
"""
from __future__ import annotations

import json
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest

from app import llm_router
from app.llm_router import ROUTER, loads_object, repair_truncated
from app.main import check_lesson_shape
from app.rag import OpenRouterRag, Settings

GOOD_LESSON = {
    "notes": {"sections": [{"heading": "Core idea", "body": "A body.", "claimIds": [0]}]},
    "claims": [{"text": "A supported claim.", "evidenceIds": ["mit-0", "nptel-0"]}],
    "flashcards": [{"question": "Q?", "answer": "A.", "claimIds": [0]}],
    "quiz": [],
    "pyqs": [],
}


def catalogue_entry(model_id: str, **overrides):
    entry = {
        "id": model_id,
        "created": 1_700_000_000,
        "context_length": 131_072,
        "pricing": {"prompt": "0", "completion": "0"},
        "architecture": {"output_modalities": ["text"], "modality": "text->text"},
        "supported_parameters": ["response_format", "max_tokens"],
    }
    entry.update(overrides)
    return entry


class FakeOpenRouter(BaseHTTPRequestHandler):
    """Per-model scripted behaviour, driven by the class attributes below."""

    models: list[dict] = []
    behaviour: dict[str, str] = {}
    catalogue_status: int = 200
    requests: list[dict] = []

    def log_message(self, *_args):  # keep pytest output clean
        pass

    def _send(self, status: int, body):
        payload = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        if self.path.endswith("/models"):
            if type(self).catalogue_status != 200:
                self._send(type(self).catalogue_status, {"error": {"message": "catalogue down"}})
                return
            self._send(200, {"data": type(self).models})
            return
        self._send(404, {"error": {"message": "not found"}})

    def _completion(self, content: str):
        return {"choices": [{"message": {"role": "assistant", "content": content}, "finish_reason": "stop"}]}

    def do_POST(self):
        length = int(self.headers.get("content-length") or 0)
        payload = json.loads(self.rfile.read(length) or b"{}")
        model = payload.get("model", "")
        type(self).requests.append(payload)
        mode = type(self).behaviour.get(model, "good")

        if mode == "404":
            self._send(404, {"error": {"message": "This model is unavailable for free"}})
        elif mode == "401":
            self._send(401, {"error": {"message": "No auth credentials found"}})
        elif mode == "429-day":
            self._send(429, {"error": {"message": "Rate limit exceeded: free-models-per-day"}})
        elif mode == "empty":
            # A reasoning model that spent its budget before writing content.
            self._send(200, self._completion(None) | {"choices": [{"message": {"content": ""}, "finish_reason": "length"}]})
        elif mode == "empty-then-good":
            if "reasoning" in payload and payload["reasoning"].get("effort") == "low":
                self._send(200, self._completion(json.dumps(GOOD_LESSON)))
            else:
                self._send(200, {"choices": [{"message": {"content": None}, "finish_reason": "length"}]})
        elif mode == "prose":
            self._send(200, self._completion("Sure! Here is a lesson about the topic, written as prose with no JSON at all."))
        elif mode == "bare-only":
            # Rejects response_format/reasoning, but answers a plain request.
            if "response_format" in payload or "reasoning" in payload:
                self._send(400, {"error": {"message": "response_format is not supported by this model"}})
            else:
                self._send(200, self._completion(json.dumps(GOOD_LESSON)))
        elif mode == "fenced":
            body = json.dumps(GOOD_LESSON).replace('"quiz": []', '"quiz": [],')
            self._send(200, self._completion(f"<think>I should plan the JSON.</think>\n```json\n{body}\n```"))
        elif mode == "truncated":
            self._send(200, self._completion(json.dumps(GOOD_LESSON)[:-24]))
        elif mode == "error-200":
            self._send(200, {"error": {"code": 502, "message": "upstream provider gave up"}})
        elif mode == "bad-shape":
            self._send(200, self._completion(json.dumps({"notes": {"sections": []}, "claims": []})))
        else:
            self._send(200, self._completion(json.dumps(GOOD_LESSON)))


@pytest.fixture
def fake_openrouter():
    server = ThreadingHTTPServer(("127.0.0.1", 0), FakeOpenRouter)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    FakeOpenRouter.models = []
    FakeOpenRouter.behaviour = {}
    FakeOpenRouter.catalogue_status = 200
    FakeOpenRouter.requests = []
    ROUTER.reset()
    yield f"http://127.0.0.1:{server.server_address[1]}"
    server.shutdown()
    server.server_close()
    ROUTER.reset()


@pytest.fixture(autouse=True)
def clean_env(monkeypatch):
    for name in ("OPENROUTER_MODEL", "OPENROUTER_FALLBACK_MODELS", "OPENROUTER_PAID_FALLBACK_MODEL"):
        monkeypatch.delenv(name, raising=False)


def build_rag(base_url: str) -> OpenRouterRag:
    """A RAG client pointed at the fake provider, with Qdrant left unused."""
    settings = Settings(api_key="test-key", qdrant_url="http://127.0.0.1:6333", qdrant_api_key="", collection="test", model="", base_url=base_url)
    return OpenRouterRag(settings)


# ------------------------------------------------------------------ catalogue


def test_catalogue_filtering_skips_dead_env_slugs_and_ends_with_the_alias(fake_openrouter, monkeypatch):
    FakeOpenRouter.models = [
        catalogue_entry("meta-llama/llama-3.3-70b-instruct:free"),
        catalogue_entry("good/new-70b:free", created=1_800_000_000),
        catalogue_entry("good/older-70b:free", created=1_600_000_000),
        catalogue_entry("paid/big-70b", pricing={"prompt": "0.5", "completion": "1"}),
        catalogue_entry("tiny/small-7b:free"),
        catalogue_entry("meta/llama-guard-4-70b:free"),
        catalogue_entry("some/short-ctx-70b:free", context_length=8_000),
        catalogue_entry("media/imagegen-70b:free"),
        catalogue_entry("openrouter/free"),
    ]
    monkeypatch.setenv("OPENROUTER_MODEL", "deepseek/deepseek-v4-flash-0731:free")
    monkeypatch.setenv("OPENROUTER_FALLBACK_MODELS", "deepseek/deepseek-chat-v3-0324:free")

    chain = ROUTER.model_chain(fake_openrouter, "test-key")

    assert "deepseek/deepseek-v4-flash-0731:free" not in chain, "a dead env slug must not consume an attempt"
    assert "deepseek/deepseek-chat-v3-0324:free" not in chain
    assert "paid/big-70b" not in chain and "tiny/small-7b:free" not in chain
    assert "meta/llama-guard-4-70b:free" not in chain and "media/imagegen-70b:free" not in chain
    assert "some/short-ctx-70b:free" not in chain
    assert chain[0] == "meta-llama/llama-3.3-70b-instruct:free", "curated models come before discovery"
    assert chain.index("good/new-70b:free") < chain.index("good/older-70b:free"), "newest discovered model first"
    assert chain[-1] == "openrouter/free", "the aggregator alias is the last resort"


def test_a_live_env_hint_is_honoured_before_the_curated_list(fake_openrouter, monkeypatch):
    FakeOpenRouter.models = [catalogue_entry("house/favourite-70b:free"), catalogue_entry("meta-llama/llama-3.3-70b-instruct:free")]
    monkeypatch.setenv("OPENROUTER_MODEL", "house/favourite-70b:free")
    assert ROUTER.model_chain(fake_openrouter, "test-key")[0] == "house/favourite-70b:free"


def test_an_unreachable_catalogue_still_yields_a_usable_chain(fake_openrouter, monkeypatch):
    FakeOpenRouter.catalogue_status = 500
    monkeypatch.setenv("OPENROUTER_MODEL", "custom/whatever:free")
    chain = ROUTER.model_chain(fake_openrouter, "test-key")
    assert chain[0] == "custom/whatever:free", "without a catalogue every id is assumed to exist"
    assert set(llm_router.CURATED_MODELS) <= set(chain)
    assert chain[-1] == "openrouter/free"


def test_cooldowns_demote_a_model_instead_of_deleting_it(fake_openrouter):
    FakeOpenRouter.models = [catalogue_entry(model) for model in llm_router.CURATED_MODELS]
    first = llm_router.CURATED_MODELS[0]
    ROUTER.penalise(first, "gone", "HTTP 404")
    chain = ROUTER.model_chain(fake_openrouter, "test-key")
    assert first in chain and chain.index(first) > 0, "a dead model moves to the back, it is not removed"


def test_last_known_good_model_is_tried_first_next_time(fake_openrouter):
    FakeOpenRouter.models = [catalogue_entry(model) for model in llm_router.CURATED_MODELS]
    ROUTER.mark_ok(llm_router.CURATED_MODELS[3])
    assert ROUTER.model_chain(fake_openrouter, "test-key")[0] == llm_router.CURATED_MODELS[3]


def test_per_day_rate_limits_earn_a_much_longer_cooldown():
    assert ROUTER.classify(429, "Rate limit exceeded: free-models-per-day") == "rate_limited_day"
    assert ROUTER.classify(429, "too many requests") == "rate_limited"
    assert ROUTER.classify(404, "") == "gone" and ROUTER.classify(402, "") == "denied"
    assert ROUTER.classify(None, "timed out") == "transient"


# --------------------------------------------------------------------- parsing


def test_fenced_json_with_think_block_and_trailing_commas_parses():
    raw = '<think>Let me plan this.</think>\n```json\n{"a": [1, 2,], "b": {"c": 1,},}\n```'
    value, repaired = loads_object(raw)
    assert value == {"a": [1, 2], "b": {"c": 1}} and not repaired


def test_json_surrounded_by_prose_parses():
    value, _ = loads_object('Sure! Here you go:\n{"ok": true}\nLet me know if you need more.')
    assert value == {"ok": True}


def test_truncated_json_is_repaired():
    raw = '{"notes": {"sections": [{"heading": "Core", "body": "Full body."}, {"heading": "Second", "bo'
    value, repaired = loads_object(raw)
    assert repaired is True
    assert value["notes"]["sections"][0]["heading"] == "Core"


def test_repair_closes_open_brackets_and_quotes():
    assert json.loads(repair_truncated('{"a": [1, 2, 3'))["a"] == [1, 2, 3]
    assert json.loads(repair_truncated('{"a": "unterminated'))["a"] == "unterminated"


def test_a_reply_without_any_json_is_rejected():
    with pytest.raises(ValueError):
        loads_object("I am sorry, I cannot help with that request.")


# ------------------------------------------------------------------ generation


def test_empty_then_dead_then_prose_then_good_model_succeeds_and_is_remembered(fake_openrouter):
    chain = ["a/empty-70b:free", "b/dead-70b:free", "c/prose-70b:free", "d/good-70b:free"]
    FakeOpenRouter.models = [catalogue_entry(model, created=1_800_000_000 - index) for index, model in enumerate(chain)]
    FakeOpenRouter.behaviour = {"a/empty-70b:free": "empty", "b/dead-70b:free": "404", "c/prose-70b:free": "prose", "d/good-70b:free": "good"}
    rag = build_rag(fake_openrouter)

    lesson = rag.structured_generate("write a lesson", validator=check_lesson_shape)
    assert lesson["claims"][0]["text"] == "A supported claim."

    assert ROUTER.last_good() == "d/good-70b:free"
    assert ROUTER.model_chain(fake_openrouter, "test-key")[0] == "d/good-70b:free"
    FakeOpenRouter.requests.clear()
    rag.structured_generate("write another lesson", validator=check_lesson_shape)
    assert FakeOpenRouter.requests[0]["model"] == "d/good-70b:free", "the next call starts with the known-good model"


def test_a_model_that_rejects_response_format_succeeds_on_the_bare_retry(fake_openrouter):
    FakeOpenRouter.models = [catalogue_entry("a/picky-70b:free")]
    FakeOpenRouter.behaviour = {"a/picky-70b:free": "bare-only"}
    lesson = build_rag(fake_openrouter).structured_generate("write a lesson", validator=check_lesson_shape)
    assert lesson["notes"]["sections"]
    retry = FakeOpenRouter.requests[-1]
    assert "response_format" not in retry and "reasoning" not in retry


def test_an_empty_reply_is_retried_with_low_reasoning_effort(fake_openrouter):
    FakeOpenRouter.models = [catalogue_entry("a/hybrid-70b:free")]
    FakeOpenRouter.behaviour = {"a/hybrid-70b:free": "empty-then-good"}
    assert build_rag(fake_openrouter).structured_generate("write a lesson", validator=check_lesson_shape)["claims"]
    assert FakeOpenRouter.requests[-1]["reasoning"] == {"effort": "low"}


def test_fenced_and_truncated_replies_are_accepted_when_the_validator_passes(fake_openrouter):
    for mode in ("fenced", "truncated"):
        ROUTER.reset()
        FakeOpenRouter.models = [catalogue_entry("a/messy-70b:free")]
        FakeOpenRouter.behaviour = {"a/messy-70b:free": mode}
        lesson = build_rag(fake_openrouter).structured_generate("write a lesson", validator=check_lesson_shape)
        assert lesson["notes"]["sections"][0]["heading"] == "Core idea"
        assert lesson["claims"][0]["evidenceIds"] == ["mit-0", "nptel-0"]


def test_a_structurally_invalid_lesson_moves_to_the_next_model(fake_openrouter):
    FakeOpenRouter.models = [catalogue_entry("a/weak-70b:free", created=1_800_000_000), catalogue_entry("b/strong-70b:free", created=1_700_000_000)]
    FakeOpenRouter.behaviour = {"a/weak-70b:free": "bad-shape", "b/strong-70b:free": "good"}
    assert build_rag(fake_openrouter).structured_generate("write a lesson", validator=check_lesson_shape)["claims"]
    assert ROUTER.last_good() == "b/strong-70b:free"


def test_http_200_carrying_an_error_body_is_treated_as_a_failure(fake_openrouter):
    FakeOpenRouter.models = [catalogue_entry("a/broken-70b:free", created=1_800_000_000), catalogue_entry("b/good-70b:free", created=1_700_000_000)]
    FakeOpenRouter.behaviour = {"a/broken-70b:free": "error-200", "b/good-70b:free": "good"}
    assert build_rag(fake_openrouter).structured_generate("write a lesson", validator=check_lesson_shape)["claims"]


def test_a_401_fails_fast_without_walking_the_chain(fake_openrouter):
    FakeOpenRouter.models = [catalogue_entry(f"m{index}/model-70b:free") for index in range(4)]
    FakeOpenRouter.behaviour = {f"m{index}/model-70b:free": "401" for index in range(4)}
    with pytest.raises(RuntimeError, match="rejected the API key"):
        build_rag(fake_openrouter).structured_generate("write a lesson", validator=check_lesson_shape)
    assert len(FakeOpenRouter.requests) == 1


def test_stale_env_values_and_dead_slugs_still_produce_a_lesson(fake_openrouter, monkeypatch):
    """The exact production configuration that broke: dead slugs, stale tuning.

    Leftover dashboard variables must be inert, not fatal — nobody should have
    to clean up their environment for a lesson to generate.
    """
    monkeypatch.setenv("OPENROUTER_MODEL", "deepseek/deepseek-v4-flash-0731:free")
    monkeypatch.setenv("OPENROUTER_FALLBACK_MODELS", "deepseek/deepseek-chat-v3-0324:free,qwen/qwen-2.5-72b-instruct:free")
    monkeypatch.setenv("OPENROUTER_STRUCTURED_MAX_TOKENS", "2200")
    monkeypatch.setenv("OPENROUTER_STRUCTURED_MAX_MODELS", "2")
    monkeypatch.setenv("OPENROUTER_REQUEST_TIMEOUT_SECONDS", "240")
    FakeOpenRouter.models = [catalogue_entry("a/live-70b:free")]
    FakeOpenRouter.behaviour = {"a/live-70b:free": "good"}

    lesson = build_rag(fake_openrouter).structured_generate("write a lesson", validator=check_lesson_shape)

    assert lesson["claims"], "a lesson must be produced with zero manual model edits"
    assert FakeOpenRouter.requests[0]["max_tokens"] == 4096, "budgets are code constants, not env values"


def test_the_error_message_shown_to_a_learner_is_readable(fake_openrouter):
    FakeOpenRouter.models = [catalogue_entry(f"m{index}/model-70b:free") for index in range(3)]
    FakeOpenRouter.behaviour = {f"m{index}/model-70b:free": "404" for index in range(3)} | {"openrouter/free": "404"}
    with pytest.raises(RuntimeError) as failure:
        build_rag(fake_openrouter).structured_generate("write a lesson", validator=check_lesson_shape)
    message = str(failure.value)
    assert message.startswith("Every free AI model was busy, unavailable or returned unusable output (tried ")
    assert "Please retry in a minute." in message
    assert "HTTP 404" in message, "per-model detail is kept after the readable summary"


def test_the_paid_tier_is_only_used_after_the_free_chain_and_only_when_set(fake_openrouter, monkeypatch):
    FakeOpenRouter.models = [catalogue_entry("a/dead-70b:free")]
    FakeOpenRouter.behaviour = {"a/dead-70b:free": "404", "openrouter/free": "404", "paid/reliable-mini": "good"}
    assert "paid/reliable-mini" not in ROUTER.model_chain(fake_openrouter, "test-key", include_paid=True)

    monkeypatch.setenv("OPENROUTER_PAID_FALLBACK_MODEL", "paid/reliable-mini")
    lesson = build_rag(fake_openrouter).structured_generate("write a lesson", validator=check_lesson_shape)
    assert lesson["claims"]
    assert FakeOpenRouter.requests[-1]["model"] == "paid/reliable-mini"


def test_chat_falls_back_across_models_too(fake_openrouter):
    FakeOpenRouter.models = [catalogue_entry("a/dead-70b:free", created=1_800_000_000), catalogue_entry("b/good-70b:free", created=1_700_000_000)]
    FakeOpenRouter.behaviour = {"a/dead-70b:free": "404", "b/good-70b:free": "prose"}
    text, model = build_rag(fake_openrouter).chat_with_model([{"role": "user", "content": "hello"}], "be helpful")
    assert model == "b/good-70b:free" and len(text) >= 40


def test_budgets_are_fixed_constants_inside_the_api_wait_window():
    assert llm_router.STRUCTURED_TOTAL_BUDGET * 1000 < 600_000, "must finish before AGENT_RUNTIME_MAX_WAIT_MS"
    assert llm_router.STRUCTURED_ATTEMPT_TIMEOUT * llm_router.STRUCTURED_MAX_ATTEMPTS >= llm_router.STRUCTURED_TOTAL_BUDGET
    assert llm_router.CHAT_TOTAL_BUDGET < llm_router.STRUCTURED_TOTAL_BUDGET
    assert not [name for name in dir(llm_router) if name.startswith(("structured_", "chat_")) and callable(getattr(llm_router, name))], \
        "budgets must not be readable from the environment"


def test_the_health_chain_never_triggers_a_catalogue_fetch(fake_openrouter):
    rag = build_rag(fake_openrouter)
    FakeOpenRouter.models = [catalogue_entry("a/live-70b:free")]
    assert rag.model_chain(fetch=False), "a chain is always available for /health"
    assert "a/live-70b:free" not in rag.model_chain(fetch=False), "no live fetch happened"


# ------------------------------------------------------- local fallback kits


def test_a_seeded_local_kit_supplies_two_independent_offline_sources(tmp_path, monkeypatch):
    """Kits keep a topic teachable with Qdrant empty and no network available."""
    from app import local_kits
    from app.main import local_kit_evidence

    monkeypatch.setenv("EDUSWARM_LOCAL_KITS_DIR", str(tmp_path))
    local_kits._load.cache_clear()
    topic = "web-dev-backend-with-node-js-node-js-runtime"
    assert not local_kits.has_kit(topic), "no kit is seeded yet"

    local_kits.write_kit(topic, "Node.js Runtime", [
        {"source_id": "gfg-nodejs", "title": "GeeksforGeeks: Node.js Tutorial", "url": "https://www.geeksforgeeks.org/node-js/nodejs/", "text": "Node.js runs JavaScript outside the browser on an event loop. " * 6},
        {"source_id": "nodejs-learn", "title": "Node.js Learn", "url": "https://nodejs.org/en/learn", "text": "Streams process data in chunks so large payloads never load at once. " * 6},
        {"source_id": "gfg-nodejs", "title": "duplicate source", "url": "https://example.com", "text": "A duplicate source id must be ignored. " * 10},
        {"source_id": "too-short", "title": "Stub", "url": "https://example.com", "text": "Too short."},
    ])

    assert local_kits.has_kit(topic)
    evidence = local_kit_evidence(topic)
    assert len(evidence) == 2, "duplicate and too-short sources are dropped"
    assert len({chunk.source_id for chunk in evidence}) == 2, "the citation gate needs two independent sources"
    assert all(chunk.url and chunk.chunk_id.startswith("local-kit-") for chunk in evidence)
    assert topic in local_kits.available_topics()


def test_a_topic_id_from_a_request_cannot_escape_the_kits_directory(tmp_path, monkeypatch):
    from app import local_kits

    monkeypatch.setenv("EDUSWARM_LOCAL_KITS_DIR", str(tmp_path))
    path = local_kits.kit_path("../../etc/passwd")
    assert path.parent == tmp_path and ".." not in path.name
