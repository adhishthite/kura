import asyncio
import logging
import pytest
from kura.cluster import ClusterModel

@pytest.mark.asyncio
async def test_progress_logs_when_no_console(caplog):
    model = ClusterModel(console=None)

    async def dummy():
        await asyncio.sleep(0)
        return 1

    tasks = [dummy() for _ in range(5)]
    with caplog.at_level(logging.INFO):
        results = await model._gather_with_progress(tasks, desc="Testing")

    assert results == [1] * 5
    progress_logs = [r.message for r in caplog.records if "Testing" in r.message]
    assert any("5/5" in msg for msg in progress_logs)
