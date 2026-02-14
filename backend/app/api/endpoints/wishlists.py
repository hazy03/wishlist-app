from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from uuid import UUID
import shortuuid
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.wishlist import Wishlist
from app.db.models.item import Item
from app.db.models.reservation import Reservation
from app.db.models.contribution import Contribution
from app.schemas.wishlist import WishlistCreate, WishlistUpdate, WishlistResponse, WishlistPublicResponse
from app.schemas.item import ItemResponse, ContributionInfo
from app.api.deps import get_current_user, get_optional_user
from decimal import Decimal

router = APIRouter()


@router.get("", response_model=List[WishlistResponse])
async def get_my_wishlists(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all wishlists owned by the current user."""
    from sqlalchemy.orm import selectinload
    
    result = await db.execute(
        select(Wishlist)
        .where(Wishlist.owner_id == current_user.id)
        .options(selectinload(Wishlist.items))
        .order_by(Wishlist.created_at.desc())
    )
    wishlists = result.scalars().all()
    
    # Convert to response format
    wishlist_responses = []
    for wishlist in wishlists:
        # Load items explicitly
        items_result = await db.execute(
            select(Item).where(Item.wishlist_id == wishlist.id).order_by(Item.created_at.desc())
        )
        items = items_result.scalars().all()
        
        # Build item responses
        item_responses = []
        for item in items:
            item_data = {
                "id": item.id,
                "wishlist_id": item.wishlist_id,
                "title": item.title,
                "url": item.url,
                "price": item.price,
                "image_url": item.image_url,
                "is_group_gift": item.is_group_gift,
                "created_at": item.created_at,
                "updated_at": item.updated_at,
            }
            
            # Owner view: only status
            if item.is_group_gift:
                contrib_result = await db.execute(
                    select(func.coalesce(func.sum(Contribution.amount), 0)).where(
                        Contribution.item_id == item.id
                    )
                )
                total_contributions = contrib_result.scalar() or Decimal("0")
                if total_contributions >= item.price:
                    item_data["status"] = "Collected"
                else:
                    item_data["status"] = "Collecting"
                item_data["is_reserved"] = False
            else:
                res_result = await db.execute(
                    select(Reservation).where(Reservation.item_id == item.id)
                )
                reservation = res_result.scalar_one_or_none()
                item_data["is_reserved"] = reservation is not None
                item_data["status"] = "Reserved" if reservation else None
            
            item_responses.append(ItemResponse(**item_data))
        
        wishlist_dict = {
            "id": wishlist.id,
            "slug": wishlist.slug,
            "title": wishlist.title,
            "description": wishlist.description,
            "owner_id": wishlist.owner_id,
            "created_at": wishlist.created_at,
            "updated_at": wishlist.updated_at,
            "items": item_responses,
        }
        wishlist_responses.append(WishlistResponse(**wishlist_dict))
    
    return wishlist_responses


@router.post("", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
async def create_wishlist(
    wishlist_data: WishlistCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new wishlist."""
    # Generate unique slug
    slug = f"wishlist-{shortuuid.uuid()}"
    
    new_wishlist = Wishlist(
        slug=slug,
        title=wishlist_data.title,
        description=wishlist_data.description,
        owner_id=current_user.id
    )
    
    db.add(new_wishlist)
    await db.commit()
    await db.refresh(new_wishlist)
    
    # Convert to dict to avoid lazy loading issues during Pydantic serialization
    wishlist_dict = {
        "id": new_wishlist.id,
        "slug": new_wishlist.slug,
        "title": new_wishlist.title,
        "description": new_wishlist.description,
        "owner_id": new_wishlist.owner_id,
        "created_at": new_wishlist.created_at,
        "updated_at": new_wishlist.updated_at,
        "items": [],  # Empty list for new wishlist
    }
    
    return WishlistResponse(**wishlist_dict)


@router.get("/{slug}")
async def get_wishlist(
    slug: str,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a wishlist by slug. Returns different data based on ownership."""
    result = await db.execute(select(Wishlist).where(Wishlist.slug == slug))
    wishlist = result.scalar_one_or_none()
    
    if not wishlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found"
        )
    
    # Check if current user is owner
    is_owner = current_user and wishlist.owner_id == current_user.id
    
    # Load items
    items_result = await db.execute(
        select(Item).where(Item.wishlist_id == wishlist.id).order_by(Item.created_at.desc())
    )
    items = items_result.scalars().all()
    
    # Build item responses with aggregated data
    item_responses = []
    for item in items:
        item_data = {
            "id": item.id,
            "wishlist_id": item.wishlist_id,
            "title": item.title,
            "url": item.url,
            "price": item.price,
            "image_url": item.image_url,
            "is_group_gift": item.is_group_gift,
            "created_at": item.created_at,
            "updated_at": item.updated_at,
        }
        
        if is_owner:
            # Owner view: only status, no names/amounts
            if item.is_group_gift:
                # Get total contributions
                contrib_result = await db.execute(
                    select(func.coalesce(func.sum(Contribution.amount), 0)).where(
                        Contribution.item_id == item.id
                    )
                )
                total_contributions = contrib_result.scalar() or Decimal("0")
                
                if total_contributions >= item.price:
                    item_data["status"] = "Collected"
                else:
                    item_data["status"] = "Collecting"
                item_data["is_reserved"] = False
            else:
                # Check if reserved
                res_result = await db.execute(
                    select(Reservation).where(Reservation.item_id == item.id)
                )
                reservation = res_result.scalar_one_or_none()
                item_data["is_reserved"] = reservation is not None
                item_data["status"] = "Reserved" if reservation else None
        else:
            # Public view: detailed info
            if item.is_group_gift:
                # Get contributions with names
                contrib_result = await db.execute(
                    select(Contribution).where(Contribution.item_id == item.id).order_by(Contribution.created_at)
                )
                contributions = contrib_result.scalars().all()
                
                total_contributions = sum(c.amount for c in contributions) or Decimal("0")
                
                item_data["total_contributions"] = total_contributions
                item_data["contributions"] = [
                    ContributionInfo(
                        name=c.guest_name or (f"User {str(c.user_id)[:8]}" if c.user_id else "Anonymous"),
                        amount=c.amount
                    )
                    for c in contributions
                ]
                item_data["reserved_by"] = None
            else:
                # Check reservation
                res_result = await db.execute(
                    select(Reservation).where(Reservation.item_id == item.id)
                )
                reservation = res_result.scalar_one_or_none()
                
                if reservation:
                    item_data["reserved_by"] = reservation.guest_name or (f"User {str(reservation.user_id)[:8]}" if reservation.user_id else "Anonymous")
                else:
                    item_data["reserved_by"] = None
                item_data["total_contributions"] = None
                item_data["contributions"] = None
        
        item_responses.append(ItemResponse(**item_data))
    
    wishlist_dict = {
        "id": wishlist.id,
        "slug": wishlist.slug,
        "title": wishlist.title,
        "description": wishlist.description,
        "created_at": wishlist.created_at,
        "updated_at": wishlist.updated_at,
        "items": item_responses,
    }
    
    if is_owner:
        wishlist_dict["owner_id"] = wishlist.owner_id
        return WishlistResponse(**wishlist_dict)
    else:
        return WishlistPublicResponse(**wishlist_dict)


@router.put("/{slug}", response_model=WishlistResponse)
async def update_wishlist(
    slug: str,
    wishlist_data: WishlistUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a wishlist (owner only)."""
    result = await db.execute(select(Wishlist).where(Wishlist.slug == slug))
    wishlist = result.scalar_one_or_none()
    
    if not wishlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found"
        )
    
    if wishlist.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this wishlist"
        )
    
    if wishlist_data.title is not None:
        wishlist.title = wishlist_data.title
    if wishlist_data.description is not None:
        wishlist.description = wishlist_data.description
    
    await db.commit()
    await db.refresh(wishlist)
    
    # Load items for response (owner view)
    items_result = await db.execute(
        select(Item).where(Item.wishlist_id == wishlist.id).order_by(Item.created_at.desc())
    )
    items = items_result.scalars().all()
    
    # Build item responses
    item_responses = []
    for item in items:
        item_data = {
            "id": item.id,
            "wishlist_id": item.wishlist_id,
            "title": item.title,
            "url": item.url,
            "price": item.price,
            "image_url": item.image_url,
            "is_group_gift": item.is_group_gift,
            "created_at": item.created_at,
            "updated_at": item.updated_at,
        }
        
        if item.is_group_gift:
            contrib_result = await db.execute(
                select(func.coalesce(func.sum(Contribution.amount), 0)).where(
                    Contribution.item_id == item.id
                )
            )
            total_contributions = contrib_result.scalar() or Decimal("0")
            if total_contributions >= item.price:
                item_data["status"] = "Collected"
            else:
                item_data["status"] = "Collecting"
            item_data["is_reserved"] = False
        else:
            res_result = await db.execute(
                select(Reservation).where(Reservation.item_id == item.id)
            )
            reservation = res_result.scalar_one_or_none()
            item_data["is_reserved"] = reservation is not None
            item_data["status"] = "Reserved" if reservation else None
        
        item_responses.append(ItemResponse(**item_data))
    
    wishlist_dict = {
        "id": wishlist.id,
        "slug": wishlist.slug,
        "title": wishlist.title,
        "description": wishlist.description,
        "owner_id": wishlist.owner_id,
        "created_at": wishlist.created_at,
        "updated_at": wishlist.updated_at,
        "items": item_responses,
    }
    
    return WishlistResponse(**wishlist_dict)


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_wishlist(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a wishlist (owner only)."""
    result = await db.execute(select(Wishlist).where(Wishlist.slug == slug))
    wishlist = result.scalar_one_or_none()
    
    if not wishlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found"
        )
    
    if wishlist.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this wishlist"
        )
    
    await db.delete(wishlist)
    await db.commit()
    
    return None

