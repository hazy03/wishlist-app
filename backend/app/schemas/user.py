from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime, date


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    birthday: Optional[date | str] = None  # Accept string for empty values
    location: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    avatar_url: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "John Doe",
                "bio": "Hello!",
                "birthday": "1990-01-01",
                "location": "Moscow",
                "phone": "+79991234567",
                "website": "https://example.com",
                "avatar_url": "https://example.com/avatar.jpg"
            }
        }


class UserResponse(UserBase):
    id: UUID
    provider: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    birthday: Optional[date] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserPublicProfile(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    birthday: Optional[date] = None
    location: Optional[str] = None
    website: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

