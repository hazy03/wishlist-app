from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.db.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.core.security import verify_password, get_password_hash, create_access_token
from app.api.deps import get_current_user
from app.core.config import settings
from authlib.integrations.starlette_client import OAuth, OAuthError
from urllib.parse import urlencode

router = APIRouter()

# OAuth configuration
oauth = None
if settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET:
    try:
        oauth = OAuth()
        oauth.register(
            name='google',
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
            client_kwargs={
                'scope': 'openid email profile'
            }
        )
    except Exception as e:
        print(f"⚠️  OAuth configuration error: {e}")
        oauth = None


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    try:
        # Check if user already exists
        result = await db.execute(select(User).where(User.email == user_data.email))
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        new_user = User(
            email=user_data.email,
            password_hash=hashed_password,
            full_name=user_data.full_name,
            provider="local"
        )
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        return new_user
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"❌ Error in register: {type(e).__name__}: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login and get access token."""
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    # Check if user exists
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User with this email does not exist"
        )
    
    # Check if user has password (not OAuth user)
    if not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account was created with social login. Please use social login to sign in."
        )
    
    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return TokenResponse(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user


@router.get("/google")
async def google_login(request: Request):
    """Initiate Google OAuth login."""
    if not oauth:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables."
        )
    
    # Build redirect URI for callback
    redirect_uri = str(request.base_url).rstrip('/') + "/api/auth/google/callback"
    
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle Google OAuth callback."""
    frontend_url = settings.FRONTEND_URL
    
    if not oauth:
        return RedirectResponse(
            url=f"{frontend_url}/auth/callback?error=oauth_not_configured"
        )
    
    try:
        token = await oauth.google.authorize_access_token(request)
    except OAuthError as e:
        return RedirectResponse(
            url=f"{frontend_url}/auth/callback?error={urlencode({'error': str(e)})}"
        )
    except Exception as e:
        return RedirectResponse(
            url=f"{frontend_url}/auth/callback?error=oauth_error"
        )
    
    # Get user info from Google
    user_info = token.get('userinfo')
    if not user_info:
        return RedirectResponse(
            url=f"{frontend_url}/auth/callback?error=no_user_info"
        )
    
    email = user_info.get('email')
    if not email:
        return RedirectResponse(
            url=f"{frontend_url}/auth/callback?error=no_email"
        )
    
    try:
        # Check if user exists
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            # Create new user
            user = User(
                email=email,
                full_name=user_info.get('name'),
                avatar_url=user_info.get('picture'),
                provider="google",
                provider_id=user_info.get('sub'),
                password_hash=None  # OAuth users don't have passwords
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        else:
            # Update existing user if needed
            if user.provider != "google":
                user.provider = "google"
                user.provider_id = user_info.get('sub')
            if not user.avatar_url and user_info.get('picture'):
                user.avatar_url = user_info.get('picture')
            if not user.full_name and user_info.get('name'):
                user.full_name = user_info.get('name')
            await db.commit()
            await db.refresh(user)
        
        # Create access token
        access_token = create_access_token(data={"sub": str(user.id)})
        
        # Redirect to frontend with token
        frontend_url = settings.FRONTEND_URL
        return RedirectResponse(
            url=f"{frontend_url}/auth/callback?token={access_token}"
        )
    except Exception as e:
        import traceback
        print(f"❌ Error in OAuth callback: {type(e).__name__}: {e}")
        traceback.print_exc()
        return RedirectResponse(
            url=f"{frontend_url}/auth/callback?error=database_error"
        )

