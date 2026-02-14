import asyncio
from app.db.base import engine, Base
from sqlalchemy import text

async def test_connection():
    try:
        # Test connection
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            row = result.fetchone()
            print("✅ Подключение к базе данных работает!")
            print(f"   Результат теста: {row[0]}")
        
        # Create tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Таблицы созданы/проверены!")
        
        # Check if tables exist
        async with engine.connect() as conn:
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            tables = [row[0] for row in result.fetchall()]
            print(f"✅ Найдено таблиц: {len(tables)}")
            if tables:
                print(f"   Таблицы: {', '.join(tables)}")
            else:
                print("   ⚠️  Таблицы не найдены!")
                
    except Exception as e:
        print(f"❌ Ошибка: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_connection())

