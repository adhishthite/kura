import os
import pytest
from kura.v1.kura import (
    generate_base_clusters_from_conversation_summaries,
    CheckpointManager,
)
from kura.types import Cluster, ConversationSummary, ClusteringError
from kura.base_classes.cluster import BaseClusterModel


class DummyClusterModel(BaseClusterModel):
    def __init__(self):
        self.called = []
        self.errors = []

    @property
    def checkpoint_filename(self) -> str:
        return "clusters.jsonl"

    async def cluster_summaries(
        self,
        summaries: list[ConversationSummary],
        *,
        processed_keys: set[tuple[str, ...]] | None = None,
        batch_size: int = 100,
        sleep_seconds: float = 0.0,
    ) -> list[Cluster]:
        key = tuple(sorted(s.chat_id for s in summaries))
        self.called.append(key)
        if processed_keys and key in processed_keys:
            return []
        return [
            Cluster(
                name="c",
                description="d",
                slug="slug",
                chat_ids=[s.chat_id for s in summaries],
                parent_id=None,
            )
        ]


@pytest.mark.asyncio
async def test_generate_clusters_skips_errors(tmp_path):
    summaries = [
        ConversationSummary(chat_id="1", summary="a", metadata={}),
        ConversationSummary(chat_id="2", summary="b", metadata={}),
    ]

    manager = CheckpointManager(str(tmp_path), enabled=True)
    error_file = os.path.join(manager.checkpoint_dir, "clusters_errors.jsonl")
    with open(error_file, "w") as f:
        f.write(ClusteringError(chat_ids=["2"], error="fail").model_dump_json() + "\n")

    model = DummyClusterModel()
    results = await generate_base_clusters_from_conversation_summaries(
        summaries,
        model=model,
        checkpoint_manager=manager,
    )

    assert model.called == [("1", "2")]
    assert [tuple(c.chat_ids) for c in results] == [("1",)]
