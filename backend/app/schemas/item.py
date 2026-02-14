from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal


class ItemBase(BaseModel):
    title: str
    url: Optional[str] = None
    price: Decimal
    image_url: Optional[str] = None
    is_group_gift: bool = False


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    price: Optional[Decimal] = None
    image_url: Optional[str] = None
    is_group_gift: Optional[bool] = None


class ContributionInfo(BaseModel):
    name: str
    amount: Decimal
    
    class Config:
        from_attributes = True


class ItemResponse(ItemBase):
    id: UUID
    wishlist_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Owner view: only status
    is_reserved: Optional[bool] = None
    status: Optional[str] = None  # "Reserved", "Collecting", "Collected"
    
    # Public view: detailed info
    reserved_by: Optional[str] = None  # name (only for public view)
    total_contributions: Optional[Decimal] = None
    contributions: Optional[List[ContributionInfo]] = None
    
    class Config:
        from_attributes = True

