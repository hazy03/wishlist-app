from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from decimal import Decimal


class ContributionCreate(BaseModel):
    guest_name: Optional[str] = None
    amount: Decimal


class ContributionResponse(BaseModel):
    id: UUID
    item_id: UUID
    guest_name: Optional[str] = None
    amount: Decimal
    
    class Config:
        from_attributes = True

