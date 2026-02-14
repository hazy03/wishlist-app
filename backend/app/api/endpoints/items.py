from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from uuid import UUID
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.wishlist import Wishlist
from app.db.models.item import Item
from app.schemas.item import ItemCreate, ItemUpdate, ItemResponse
from app.api.deps import get_current_user, get_optional_user
from app.core.websocket_manager import ws_manager

router = APIRouter()


@router.get("/wishlists/{slug}/items", response_model=List[ItemResponse])
async def get_items(
    slug: str,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all items for a wishlist."""
    result = await db.execute(select(Wishlist).where(Wishlist.slug == slug))
    wishlist = result.scalar_one_or_none()
    
    if not wishlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found"
        )
    
    items_result = await db.execute(
        select(Item).where(Item.wishlist_id == wishlist.id).order_by(Item.created_at.desc())
    )
    items = items_result.scalars().all()
    
    # Convert to response format to avoid lazy loading issues
    item_responses = []
    for item in items:
        item_dict = {
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
        item_responses.append(ItemResponse(**item_dict))
    
    return item_responses


@router.post("/wishlists/{slug}/items", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    slug: str,
    item_data: ItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new item in a wishlist (owner only)."""
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
            detail="Not authorized to add items to this wishlist"
        )
    
    new_item = Item(
        wishlist_id=wishlist.id,
        title=item_data.title,
        url=item_data.url,
        price=item_data.price,
        image_url=item_data.image_url,
        is_group_gift=item_data.is_group_gift,
        created_by=current_user.id
    )
    
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    
    # Broadcast update
    await ws_manager.broadcast_wishlist_update(slug)
    
    # Convert to response format to avoid lazy loading issues
    item_dict = {
        "id": new_item.id,
        "wishlist_id": new_item.wishlist_id,
        "title": new_item.title,
        "url": new_item.url,
        "price": new_item.price,
        "image_url": new_item.image_url,
        "is_group_gift": new_item.is_group_gift,
        "created_at": new_item.created_at,
        "updated_at": new_item.updated_at,
    }
    
    return ItemResponse(**item_dict)


@router.put("/items/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: UUID,
    item_data: ItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an item (owner only)."""
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    # Get wishlist to check ownership
    wishlist_result = await db.execute(select(Wishlist).where(Wishlist.id == item.wishlist_id))
    wishlist = wishlist_result.scalar_one()
    
    if wishlist.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this item"
        )
    
    if item_data.title is not None:
        item.title = item_data.title
    if item_data.url is not None:
        item.url = item_data.url
    if item_data.price is not None:
        item.price = item_data.price
    if item_data.image_url is not None:
        item.image_url = item_data.image_url
    if item_data.is_group_gift is not None:
        item.is_group_gift = item_data.is_group_gift
    
    await db.commit()
    await db.refresh(item)
    
    # Broadcast update
    await ws_manager.broadcast_wishlist_update(wishlist.slug)
    
    # Convert to response format to avoid lazy loading issues
    item_dict = {
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
    
    return ItemResponse(**item_dict)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an item (owner only)."""
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    # Get wishlist to check ownership and get slug
    wishlist_result = await db.execute(select(Wishlist).where(Wishlist.id == item.wishlist_id))
    wishlist = wishlist_result.scalar_one()
    
    if wishlist.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this item"
        )
    
    slug = wishlist.slug
    
    # Delete the item using proper SQLAlchemy 2.0 syntax
    await db.execute(delete(Item).where(Item.id == item_id))
    await db.commit()
    
    # Broadcast update
    await ws_manager.broadcast_wishlist_update(slug)
    
    return None

