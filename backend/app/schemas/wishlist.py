from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.schemas.item import ItemResponse


class WishlistBase(BaseModel):
    title: str
    description: Optional[str] = None


class WishlistCreate(WishlistBase):
    pass


class WishlistUpdate(WishlistBase):
    title: Optional[str] = None
    description: Optional[str] = None


class WishlistResponse(WishlistBase):
    id: UUID
    slug: str
    owner_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[ItemResponse] = []
    
    class Config:
        from_attributes = True


class WishlistPublicResponse(WishlistBase):
    id: UUID
    slug: str
    created_at: datetime
    items: List[ItemResponse] = []
    
    class Config:
        from_attributes = True

