"""Tests for due_date handling in item use cases"""

from datetime import datetime, timezone, timedelta

from unittest.mock import AsyncMock

import pytest

from app.items.application.use_cases.item_use_cases import (
    CreateItemUseCase,
    UpdateItemUseCase,
)
from tests.items.application.fixtures import (
    create_item_create_dto,
    create_item_entity,
    create_item_update_dto,
)


class TestItemDueDateUseCases:
    @pytest.mark.asyncio
    async def test_create_passes_due_date_to_repository(self):
        mock_repo = AsyncMock()
        due = datetime(2026, 2, 25, 15, 0, 0, tzinfo=timezone.utc)
        dto = create_item_create_dto(name="New", due_date=due)

        created_entity = create_item_entity(id=1, name="New", due_date=due)
        mock_repo.create.return_value = created_entity

        use_case = CreateItemUseCase(mock_repo)

        result = await use_case.execute(dto)

        assert result.id == 1
        # ensure repository.create received an Item with correct due_date
        call_args = mock_repo.create.call_args
        assert call_args is not None
        passed_item = call_args[0][0]
        assert getattr(passed_item, "due_date") == due

    @pytest.mark.asyncio
    async def test_update_changes_due_date_when_provided(self):
        mock_repo = AsyncMock()
        old_due = datetime(2026, 2, 20, 12, 0, 0, tzinfo=timezone.utc)
        new_due = datetime(2026, 2, 28, 9, 30, 0, tzinfo=timezone.utc)

        current_item = create_item_entity(id=1, name="Old", due_date=old_due)
        updated_item = create_item_entity(id=1, name="Old", due_date=new_due)

        mock_repo.get_by_id.return_value = current_item
        mock_repo.update.return_value = updated_item

        dto = create_item_update_dto(name=None, description=None, due_date=new_due)
        use_case = UpdateItemUseCase(mock_repo)

        result = await use_case.execute(item_id=1, dto=dto)

        assert result is not None
        assert result.due_date == new_due
        mock_repo.get_by_id.assert_called_once_with(1)
        mock_repo.update.assert_called_once()

