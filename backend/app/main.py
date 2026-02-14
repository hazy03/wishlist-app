from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from app.core.config import settings
from app.api.endpoints import auth, wishlists, items, reservations, contributions, autofill, friends, profile
from app.core.websocket_manager import ws_manager
from app.db.base import engine, Base
from app.db.models import User, Wishlist, Item, Reservation, Contribution, Friendship
import asyncio

app = FastAPI(title="Social Wishlist API", version="1.0.0")

# CORS middleware - должен быть первым
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# Явная обработка OPTIONS для всех маршрутов
@app.middleware("http")
async def handle_options(request: Request, call_next):
    if request.method == "OPTIONS":
        origin = request.headers.get("origin", "*")
        response = Response(status_code=200)
        response.headers["Access-Control-Allow-Origin"] = origin if origin in settings.allowed_origins_list else settings.allowed_origins_list[0]
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Max-Age"] = "600"
        return response
    return await call_next(request)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(wishlists.router, prefix="/api/wishlists", tags=["wishlists"])
app.include_router(items.router, prefix="/api", tags=["items"])
app.include_router(reservations.router, prefix="/api", tags=["reservations"])
app.include_router(contributions.router, prefix="/api", tags=["contributions"])
app.include_router(autofill.router, prefix="/api/autofill", tags=["autofill"])
app.include_router(friends.router, prefix="/api", tags=["friends"])
app.include_router(profile.router, prefix="/api", tags=["profile"])


@app.websocket("/ws/{slug}")
async def websocket_endpoint(websocket: WebSocket, slug: str):
    """WebSocket endpoint for real-time wishlist updates."""
    await ws_manager.connect(websocket, slug)
    try:
        while True:
            # Keep connection alive and handle any incoming messages
            data = await websocket.receive_text()
            # Echo back or ignore (server only pushes updates)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, slug)


@app.on_event("startup")
async def startup():
    """Initialize database on startup."""
    try:
        # Test connection first
        from sqlalchemy import text
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            result.fetchone()
        print("✅ Database connection test successful!")
        
        # Create tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Database tables created/verified!")
        
        # Add new columns to users table if they don't exist
        try:
            async with engine.begin() as conn:
                await conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS bio TEXT,
                    ADD COLUMN IF NOT EXISTS birthday DATE,
                    ADD COLUMN IF NOT EXISTS location VARCHAR(255),
                    ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
                    ADD COLUMN IF NOT EXISTS website VARCHAR(255),
                    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;
                """))
                await conn.execute(text("""
                    UPDATE users SET updated_at = created_at WHERE updated_at IS NULL;
                """))
            print("✅ User profile columns added/verified!")
        except Exception as e:
            print(f"⚠️  Could not add profile columns (may already exist): {e}")
    except Exception as e:
        error_msg = str(e)
        print(f"\n❌ Database connection failed!")
        print(f"   Error: {type(e).__name__}")
        print(f"   Details: {error_msg[:200]}")
        print(f"\n📋 Current DATABASE_URL: {settings.DATABASE_URL[:80]}...")
        print("\n⚠️  Troubleshooting:")
        print("   1. Check if your Supabase project is active")
        print("   2. Verify DATABASE_URL in .env file")
        print("   3. For Supabase, use Connection Pooling URL (port 6543)")
        print("   4. Format: postgresql+asyncpg://postgres:[PASSWORD]@[HOST]:6543/postgres")
        print("\n⚠️  Application will start, but database operations will fail.")
        print("   You can test API endpoints, but they won't work without DB connection.\n")


@app.get("/")
async def root():
    return {"message": "Social Wishlist API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

