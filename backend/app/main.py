from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from starlette.middleware.sessions import SessionMiddleware
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

# Session middleware for OAuth (must be after CORS)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    max_age=3600,
    same_site="lax",
    https_only=False,  # Set to True in production with HTTPS
)

# Явная обработка OPTIONS для всех маршрутов + логирование
@app.middleware("http")
async def handle_options(request: Request, call_next):
    origin = request.headers.get("origin", "")
    print(f"📨 {request.method} {request.url.path} from {origin}")
    
    # Проверяем, разрешен ли origin (с учетом поддоменов)
    allowed_origin = None
    for allowed in settings.allowed_origins_list:
        if origin == allowed or origin.startswith(allowed.rstrip('/')):
            allowed_origin = origin
            break
    if not allowed_origin:
        allowed_origin = settings.allowed_origins_list[0] if settings.allowed_origins_list else origin or "*"
    
    if request.method == "OPTIONS":
        print(f"🌐 CORS preflight from: {origin} -> allowed: {allowed_origin}")
        response = Response(status_code=200)
        response.headers["Access-Control-Allow-Origin"] = allowed_origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Max-Age"] = "600"
        return response
    
    response = await call_next(request)
    # Добавляем CORS заголовки ко всем ответам
    response.headers["Access-Control-Allow-Origin"] = allowed_origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    print(f"📤 Response: {response.status_code}")
    return response

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


# Добавляем CORS заголовки к ошибкам
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    from fastapi.responses import JSONResponse
    origin = request.headers.get("origin", "")
    allowed_origin = None
    for allowed in settings.allowed_origins_list:
        if origin == allowed or origin.startswith(allowed.rstrip('/')):
            allowed_origin = origin
            break
    if not allowed_origin:
        allowed_origin = settings.allowed_origins_list[0] if settings.allowed_origins_list else origin or "*"
    
    response = JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )
    response.headers["Access-Control-Allow-Origin"] = allowed_origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    from fastapi.responses import JSONResponse
    origin = request.headers.get("origin", "")
    allowed_origin = None
    for allowed in settings.allowed_origins_list:
        if origin == allowed or origin.startswith(allowed.rstrip('/')):
            allowed_origin = origin
            break
    if not allowed_origin:
        allowed_origin = settings.allowed_origins_list[0] if settings.allowed_origins_list else origin or "*"
    
    response = JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
    response.headers["Access-Control-Allow-Origin"] = allowed_origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

