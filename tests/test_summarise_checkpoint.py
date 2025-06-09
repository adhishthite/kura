from datetime import datetime
import os

import pytest

from kura.v1.kura import summarise_conversations, CheckpointManager
from kura.types.conversation import Conversation, Message
from kura.types.summarisation import SummarisationError, ConversationSummary
from kura.base_classes.summarisation import BaseSummaryModel


class DummySummaryModel(BaseSummaryModel):
    def __init__(self) -> None:
        self.called_with = []
        self.errors = []

    @property
    def checkpoint_filename(self) -> str:
        return "summaries.jsonl"

    async def summarise(
        self, conversations: list[Conversation]
    ) -> list[ConversationSummary]:
        self.called_with = [c.chat_id for c in conversations]
        return [
            ConversationSummary(chat_id=c.chat_id, summary="ok", metadata={})
            for c in conversations
        ]

    async def summarise_conversation(
        self, conversation: Conversation
    ) -> ConversationSummary:  # pragma: no cover - unused
        raise NotImplementedError

    async def apply_hooks(
        self, conversation: Conversation
    ) -> dict:  # pragma: no cover - unused
        return {}


@pytest.mark.asyncio
async def test_summarise_conversations_skips_errors(tmp_path):
    conv1 = Conversation(
        chat_id="1",
        created_at=datetime.now(),
        messages=[Message(created_at=datetime.now(), role="user", content="hi")],
        metadata={},
    )
    conv2 = Conversation(
        chat_id="2",
        created_at=datetime.now(),
        messages=[Message(created_at=datetime.now(), role="user", content="fail")],
        metadata={},
    )

    manager = CheckpointManager(str(tmp_path), enabled=True)
    error_file = os.path.join(manager.checkpoint_dir, "summaries_errors.jsonl")
    with open(error_file, "w") as f:
        f.write(SummarisationError(chat_id="2", error="fail").model_dump_json() + "\n")

    model = DummySummaryModel()

    results = await summarise_conversations(
        [conv1, conv2],
        model=model,
        checkpoint_manager=manager,
    )

    assert model.called_with == ["1"]
    assert [s.chat_id for s in results] == ["1"]
