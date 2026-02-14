from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from uuid import UUID
from decimal import Decimal
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.item import Item
from app.db.models.contribution import Contribution
from app.db.models.wishlist import Wishlist
from app.schemas.contribution import ContributionCreate, ContributionResponse
from app.api.deps import get_optional_user
from app.core.websocket_manager import ws_manager

router = APIRouter()


@router.post("/items/{item_id}/contribute", response_model=ContributionResponse, status_code=status.HTTP_201_CREATED)
async def contribute_to_item(
    item_id: UUID,
    contribution_data: ContributionCreate,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    """Contribute to a group gift item."""
    # Get item with lock to prevent concurrent contributions
    result = await db.execute(
        select(Item).where(Item.id == item_id).with_for_update()
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    # Check if item is a group gift
    if not item.is_group_gift:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot contribute to a non-group gift item"
        )
    
    # Get current total contributions
    contrib_result = await db.execute(
        select(func.coalesce(func.sum(Contribution.amount), 0)).where(
            Contribution.item_id == item_id
        )
    )
    total_contributions = contrib_result.scalar() or Decimal("0")
    
    # Calculate remaining amount
    remaining = item.price - total_contributions
    
    # Validate amount
    if contribution_data.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contribution amount must be greater than 0"
        )
    
    if contribution_data.amount > remaining:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Contribution amount exceeds remaining. Only {remaining:.2f} remaining."
        )
    
    # Require guest_name if not authenticated
    if not current_user and not contribution_data.guest_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Guest name is required for unauthenticated users"
        )
    
    # Create contribution
    new_contribution = Contribution(
        item_id=item_id,
        user_id=current_user.id if current_user else None,
        guest_name=contribution_data.guest_name if not current_user else None,
        amount=contribution_data.amount
    )
    
    db.add(new_contribution)
    await db.commit()
    await db.refresh(new_contribution)
    
    # Get wishlist slug for WebSocket broadcast
    wishlist_result = await db.execute(select(Wishlist).where(Wishlist.id == item.wishlist_id))
    wishlist = wishlist_result.scalar_one()
    
    # Broadcast update immediately
    await ws_manager.broadcast_wishlist_update(wishlist.slug)
    
    # Convert to response format
    contribution_dict = {
        "id": new_contribution.id,
        "item_id": new_contribution.item_id,
        "user_id": new_contribution.user_id,
        "guest_name": new_contribution.guest_name,
        "amount": float(new_contribution.amount),
        "created_at": new_contribution.created_at,
    }
    
    return ContributionResponse(**contribution_dict)


@router.get("/items/{item_id}/contributions", response_model=List[ContributionResponse])
async def get_contributions(
    item_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get all contributions for an item (public endpoint)."""
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    contrib_result = await db.execute(
        select(Contribution).where(Contribution.item_id == item_id).order_by(Contribution.created_at)
    )
    contributions = contrib_result.scalars().all()
    
    return contributions

