from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class ReservationCreate(BaseModel):
    guest_name: Optional[str] = None


class ReservationResponse(BaseModel):
    id: UUID
    item_id: UUID
    guest_name: Optional[str] = None
    
    class Config:
        from_attributes = True

