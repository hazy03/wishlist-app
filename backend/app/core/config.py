from typing import List
from pathlib import Path
import os
from dotenv import load_dotenv

# Загружаем .env файл вручную
# Используем абсолютный путь для надежности
import sys
backend_dir = Path(__file__).parent.parent.parent.resolve()
env_path = backend_dir / ".env"

# Также пробуем текущую рабочую директорию
if not env_path.exists():
    env_path = Path.cwd() / ".env"

if env_path.exists():
    load_dotenv(dotenv_path=str(env_path), override=True)
else:
    # Если файл не найден, пробуем загрузить из текущей директории
    load_dotenv(override=True)


class Settings:
    """Настройки приложения."""
    
    def __init__(self):
        # Database
        self.DATABASE_URL: str = os.getenv("DATABASE_URL", "")
        
        # Security
        self.SECRET_KEY: str = os.getenv("SECRET_KEY", "")
        self.ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
        self.ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))
        
        # CORS
        self.ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
        
        # Google OAuth (optional)
        self.GOOGLE_CLIENT_ID: str | None = os.getenv("GOOGLE_CLIENT_ID") or None
        self.GOOGLE_CLIENT_SECRET: str | None = os.getenv("GOOGLE_CLIENT_SECRET") or None
        
        # Frontend URL for OAuth redirects
        self.FRONTEND_URL: str = os.getenv("FRONTEND_URL", self.ALLOWED_ORIGINS.split(",")[0].strip() if self.ALLOWED_ORIGINS else "http://localhost:5173")
        
        # WebSocket
        self.WS_HEARTBEAT_INTERVAL: int = int(os.getenv("WS_HEARTBEAT_INTERVAL", "30"))
        
        # Валидация обязательных полей
        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL is required")
        if not self.SECRET_KEY:
            raise ValueError("SECRET_KEY is required")
    
    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()

