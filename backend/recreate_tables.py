import asyncio
from app.db.base import engine, Base

async def recreate_tables():
    try:
        async with engine.begin() as conn:
            # Drop all tables
            await conn.run_sync(Base.metadata.drop_all)
            print("✅ Старые таблицы удалены")
            
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
            print("✅ Новые таблицы созданы")
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(recreate_tables())

