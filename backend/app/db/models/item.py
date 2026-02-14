from sqlalchemy import Column, String, Numeric, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
import uuid


class Item(Base):
    __tablename__ = "items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    wishlist_id = Column(UUID(as_uuid=True), ForeignKey("wishlists.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    url = Column(String, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    image_url = Column(String, nullable=True)
    is_group_gift = Column(Boolean, default=False, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    wishlist = relationship("Wishlist", back_populates="items")
    reservation = relationship("Reservation", back_populates="item", uselist=False, cascade="all, delete-orphan")
    contributions = relationship("Contribution", back_populates="item", cascade="all, delete-orphan")

