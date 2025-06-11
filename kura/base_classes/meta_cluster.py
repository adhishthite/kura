from abc import ABC, abstractmethod
from kura.types.cluster import Cluster


class BaseMetaClusterModel(ABC):
    @property
    @abstractmethod
    def checkpoint_filename(self) -> str:
        """The filename to use for checkpointing this model's output."""
        pass

    @property
    def error_checkpoint_filename(self) -> str:
        """Filename for storing meta-clustering errors."""
        filename = self.checkpoint_filename
        if filename.endswith(".jsonl"):
            return filename.replace(".jsonl", "_errors.jsonl")
        return f"{filename}_errors.jsonl"

    @abstractmethod
    async def reduce_clusters(self, clusters: list[Cluster]) -> list[Cluster]:
        pass
