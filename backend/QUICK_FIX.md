# Быстрое решение проблем установки

## Проблема: pydantic-core требует Rust

### Решение:

1. **Обновите pip:**
   ```powershell
   python -m pip install --upgrade pip
   ```

2. **Установите pydantic отдельно (более новая версия с предкомпилированными пакетами):**
   ```powershell
   pip install "pydantic>=2.9.0"
   ```

3. **Затем установите остальные зависимости:**
   ```powershell
   pip install -r requirements.txt
   ```

### Если это не помогло:

**Альтернативный способ - установите зависимости без строгих версий:**

```powershell
pip install fastapi uvicorn[standard] sqlalchemy[asyncio] asyncpg alembic pydantic pydantic-settings python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv httpx beautifulsoup4 lxml shortuuid
```

Это установит последние совместимые версии всех пакетов.

