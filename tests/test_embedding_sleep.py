import asyncio
import pytest
from kura.embedding import OpenAIEmbeddingModel


@pytest.mark.asyncio
async def test_embedding_model_sleep(monkeypatch):
    calls = []

    model = OpenAIEmbeddingModel(
        model_batch_size=1, n_concurrent_jobs=1, sleep_seconds=0.1
    )

    async def fake_embed_batch(texts):
        calls.append(len(texts))
        return [[0.0] * 1]

    monkeypatch.setattr(model, "_embed_batch", fake_embed_batch)

    slept = []

    async def fake_sleep(seconds):
        slept.append(seconds)

    monkeypatch.setattr(asyncio, "sleep", fake_sleep)

    await model.embed(["a", "b"])

    assert calls == [1, 1]
    assert slept == [0.1]
