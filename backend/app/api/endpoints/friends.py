from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, func
from typing import List
from uuid import UUID
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.friendship import Friendship, FriendshipStatus
from app.db.models.wishlist import Wishlist
from app.db.models.item import Item
from app.schemas.friendship import (
    FriendshipCreate,
    FriendshipUpdate,
    FriendshipResponse,
    UserFriendResponse,
    FriendWishlistResponse
)
from app.api.deps import get_current_user
from app.core.websocket_manager import ws_manager

router = APIRouter()


@router.post("/friends/request", response_model=FriendshipResponse, status_code=status.HTTP_201_CREATED)
async def send_friend_request(
    friendship_data: FriendshipCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a friend request to another user."""
    if friendship_data.addressee_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot send friend request to yourself"
        )

    # Check if addressee exists
    result = await db.execute(select(User).where(User.id == friendship_data.addressee_id))
    addressee = result.scalar_one_or_none()
    if not addressee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check if friendship already exists
    existing_result = await db.execute(
        select(Friendship).where(
            or_(
                and_(
                    Friendship.requester_id == current_user.id,
                    Friendship.addressee_id == friendship_data.addressee_id
                ),
                and_(
                    Friendship.requester_id == friendship_data.addressee_id,
                    Friendship.addressee_id == current_user.id
                )
            )
        )
    )
    existing = existing_result.scalar_one_or_none()

    if existing:
        if existing.status == FriendshipStatus.ACCEPTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already friends with this user"
            )
        elif existing.status == FriendshipStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Friend request already pending"
            )
        else:
            # Rejected - create new request
            existing.status = FriendshipStatus.PENDING
            existing.requester_id = current_user.id
            existing.addressee_id = friendship_data.addressee_id
            await db.commit()
            await db.refresh(existing)
            return existing

    # Create new friendship request
    new_friendship = Friendship(
        requester_id=current_user.id,
        addressee_id=friendship_data.addressee_id,
        status=FriendshipStatus.PENDING
    )

    db.add(new_friendship)
    await db.commit()
    await db.refresh(new_friendship)

    return new_friendship


@router.put("/friends/{friendship_id}", response_model=FriendshipResponse)
async def update_friendship(
    friendship_id: UUID,
    friendship_data: FriendshipUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Accept or reject a friend request."""
    result = await db.execute(select(Friendship).where(Friendship.id == friendship_id))
    friendship = result.scalar_one_or_none()

    if not friendship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friendship request not found"
        )

    # Only addressee can accept/reject
    if friendship.addressee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this friendship"
        )

    if friendship.status != FriendshipStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Friendship request is not pending"
        )

    friendship.status = friendship_data.status
    await db.commit()
    await db.refresh(friendship)

    return friendship


@router.get("/friends", response_model=List[UserFriendResponse])
async def get_friends(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get list of accepted friends."""
    # Get friendships where user is requester or addressee and status is ACCEPTED
    result = await db.execute(
        select(User).join(
            Friendship,
            or_(
                and_(
                    Friendship.requester_id == current_user.id,
                    User.id == Friendship.addressee_id
                ),
                and_(
                    Friendship.addressee_id == current_user.id,
                    User.id == Friendship.requester_id
                )
            )
        ).where(Friendship.status == FriendshipStatus.ACCEPTED)
    )
    friends = result.scalars().all()

    return friends


@router.get("/friends/pending", response_model=List[FriendshipResponse])
async def get_pending_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get pending friend requests (both sent and received)."""
    result = await db.execute(
        select(Friendship).where(
            and_(
                Friendship.status == FriendshipStatus.PENDING,
            or_(
                Friendship.requester_id == current_user.id,
                Friendship.addressee_id == current_user.id
            )
            )
        )
    )
    requests = result.scalars().all()

    return requests


@router.get("/friends/{friend_id}/wishlists", response_model=List[FriendWishlistResponse])
async def get_friend_wishlists(
    friend_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get wishlists of a friend."""
    # Check if users are friends
    friendship_result = await db.execute(
        select(Friendship).where(
            and_(
                Friendship.status == FriendshipStatus.ACCEPTED,
                or_(
                    and_(
                        Friendship.requester_id == current_user.id,
                        Friendship.addressee_id == friend_id
                    ),
                    and_(
                        Friendship.requester_id == friend_id,
                        Friendship.addressee_id == current_user.id
                    )
                )
            )
        )
    )
    friendship = friendship_result.scalar_one_or_none()

    if not friendship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not friends with this user"
        )

    # Get friend's wishlists (all wishlists of the friend)
    wishlists_result = await db.execute(
        select(Wishlist).where(
            Wishlist.owner_id == friend_id
        ).order_by(Wishlist.created_at.desc())
    )
    wishlists = wishlists_result.scalars().all()

    # Get items count for each wishlist
    wishlist_responses = []
    for wishlist in wishlists:
        items_count_result = await db.execute(
            select(func.count(Item.id)).where(Item.wishlist_id == wishlist.id)
        )
        items_count = items_count_result.scalar() or 0

        wishlist_dict = {
            "id": wishlist.id,
            "title": wishlist.title,
            "description": wishlist.description,
            "slug": wishlist.slug,
            "is_public": wishlist.is_public,
            "created_at": wishlist.created_at,
            "updated_at": wishlist.updated_at,
            "items_count": items_count,
        }
        wishlist_responses.append(FriendWishlistResponse(**wishlist_dict))

    return wishlist_responses


@router.delete("/friends/{friendship_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_friendship(
    friendship_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a friendship (unfriend)."""
    result = await db.execute(select(Friendship).where(Friendship.id == friendship_id))
    friendship = result.scalar_one_or_none()

    if not friendship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friendship not found"
        )

    # Only participants can delete
    if friendship.requester_id != current_user.id and friendship.addressee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this friendship"
        )

    await db.delete(friendship)
    await db.commit()

    return None


@router.get("/users/search", response_model=List[UserFriendResponse])
async def search_users(
    query: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Search for users by email or name."""
    if len(query) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query must be at least 2 characters"
        )

    result = await db.execute(
        select(User).where(
            and_(
                User.id != current_user.id,
                or_(
                    User.email.ilike(f"%{query}%"),
                    User.full_name.ilike(f"%{query}%")
                )
            )
        ).limit(20)
    )
    users = result.scalars().all()

    return users

