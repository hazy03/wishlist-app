from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from uuid import UUID
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.item import Item
from app.db.models.reservation import Reservation
from app.db.models.wishlist import Wishlist
from app.schemas.reservation import ReservationCreate, ReservationResponse
from app.api.deps import get_optional_user
from app.core.websocket_manager import ws_manager

router = APIRouter()


@router.post("/items/{item_id}/reserve", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
async def reserve_item(
    item_id: UUID,
    reservation_data: ReservationCreate,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    """Reserve an item (single-payer gift)."""
    # Get item with lock to prevent concurrent reservations
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
    if item.is_group_gift:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot reserve a group gift item"
        )
    
    # Check if already reserved
    existing_result = await db.execute(
        select(Reservation).where(Reservation.item_id == item_id)
    )
    existing_reservation = existing_result.scalar_one_or_none()
    
    if existing_reservation:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Item is already reserved"
        )
    
    # Require guest_name if not authenticated
    if not current_user and not reservation_data.guest_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Guest name is required for unauthenticated users"
        )
    
    # Create reservation
    new_reservation = Reservation(
        item_id=item_id,
        user_id=current_user.id if current_user else None,
        guest_name=reservation_data.guest_name if not current_user else None
    )
    
    db.add(new_reservation)
    await db.commit()
    await db.refresh(new_reservation)
    
    # Get wishlist slug for WebSocket broadcast
    wishlist_result = await db.execute(select(Wishlist).where(Wishlist.id == item.wishlist_id))
    wishlist = wishlist_result.scalar_one()
    
    # Broadcast update immediately
    await ws_manager.broadcast_wishlist_update(wishlist.slug)
    
    # Convert to response format
    from app.schemas.reservation import ReservationResponse
    reservation_dict = {
        "id": new_reservation.id,
        "item_id": new_reservation.item_id,
        "user_id": new_reservation.user_id,
        "guest_name": new_reservation.guest_name,
        "created_at": new_reservation.created_at,
    }
    
    return ReservationResponse(**reservation_dict)

