from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings
import ssl

# Настройка SSL для asyncpg
# Убираем sslmode из URL и настраиваем через connect_args
database_url = settings.DATABASE_URL
if "?sslmode=" in database_url:
    database_url = database_url.split("?sslmode=")[0]
elif "&sslmode=" in database_url:
    database_url = database_url.split("&sslmode=")[0]

# Создаем SSL контекст
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# Create async engine
engine = create_async_engine(
    database_url,
    echo=False,
    future=True,
    connect_args={
        "ssl": ssl_context
    }
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()

