from abc import ABC, abstractmethod
from typing import Callable, Optional

from kura.summarisation import ConversationSummary
from kura.types import Cluster, ClusteringError


class BaseClusterModel(ABC):
    @property
    @abstractmethod
    def checkpoint_filename(self) -> str:
        """The filename to use for checkpointing this model's output."""
        pass

    @property
    def error_checkpoint_filename(self) -> str:
        """Filename for storing clustering errors."""
        filename = self.checkpoint_filename
        if filename.endswith(".jsonl"):
            return filename.replace(".jsonl", "_errors.jsonl")
        return f"{filename}_errors.jsonl"

    @abstractmethod
    async def cluster_summaries(
        self,
        summaries: list[ConversationSummary],
        *,
        processed_keys: set[tuple[str, ...]] | None = None,
        batch_size: int = 100,
        sleep_seconds: float = 0.0,
        on_batch_complete: Optional[Callable[[list[Cluster], list[ClusteringError]], None]] = None,
    ) -> list[Cluster]:
        pass

    # TODO : Add abstract method for hooks here once we start supporting it
