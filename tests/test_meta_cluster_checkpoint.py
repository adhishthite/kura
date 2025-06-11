import pytest
from kura.v1.kura import reduce_clusters_from_base_clusters, CheckpointManager
from kura.types import Cluster, MetaClusteringError
from kura.base_classes.meta_cluster import BaseMetaClusterModel


class DummyMetaModel(BaseMetaClusterModel):
    def __init__(self):
        self.called = False
        self.errors = []

    @property
    def checkpoint_filename(self) -> str:
        return "meta_clusters.jsonl"

    async def reduce_clusters(self, clusters: list[Cluster]) -> list[Cluster]:
        if not self.called:
            self.errors.append(
                MetaClusteringError(cluster_ids=[c.id for c in clusters], error="fail")
            )
            self.called = True
        return clusters


@pytest.mark.asyncio
async def test_meta_cluster_error_checkpoint(tmp_path):
    cluster = Cluster(
        name="c", description="d", slug="s", chat_ids=["1"], parent_id=None
    )
    manager = CheckpointManager(str(tmp_path), enabled=True)
    model = DummyMetaModel()

    await reduce_clusters_from_base_clusters(
        [cluster], model=model, checkpoint_manager=manager
    )

    errors = manager.load_checkpoint("meta_clusters_errors.jsonl", MetaClusteringError)
    assert errors and errors[0].error == "fail"
