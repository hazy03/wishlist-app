from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional
from app.db.models.friendship import FriendshipStatus


class FriendshipCreate(BaseModel):
    addressee_id: UUID = Field(..., description="ID of the user to send friend request to")


class FriendshipUpdate(BaseModel):
    status: FriendshipStatus = Field(..., description="New status of the friendship")


class FriendshipResponse(BaseModel):
    id: UUID
    requester_id: UUID
    addressee_id: UUID
    status: FriendshipStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserFriendResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class FriendWishlistResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    slug: str
    created_at: datetime
    updated_at: Optional[datetime]
    items_count: int = 0

    class Config:
        from_attributes = True

