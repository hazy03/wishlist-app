"""
Script to drop all tables from the database.
WARNING: This will delete ALL tables and ALL data!
Use this if you want to completely reset the database schema.
"""
import asyncio
from sqlalchemy import text, inspect
from app.db.session import engine
from app.core.config import settings
from app.db.base import Base


async def drop_all_tables():
    """Drop all tables from the database."""
    print("⚠️  WARNING: This will delete ALL tables and ALL data!")
    print(f"📋 Database: {settings.DATABASE_URL[:80]}...")
    
    confirmation = input("\n❓ Are you sure you want to proceed? Type 'DROP ALL' to confirm: ")
    if confirmation != "DROP ALL":
        print("❌ Operation cancelled.")
        return
    
    try:
        async with engine.begin() as conn:
            print("\n🗑️  Dropping all tables...")
            
            # Get all table names
            inspector = inspect(engine.sync_engine)
            tables = inspector.get_table_names()
            
            if not tables:
                print("   ℹ️  No tables found in database.")
                return
            
            # Drop tables in reverse dependency order
            # Drop dependent tables first
            drop_order = [
                'contributions',
                'reservations',
                'items',
                'friendships',
                'wishlists',
                'users'
            ]
            
            for table_name in drop_order:
                if table_name in tables:
                    await conn.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE"))
                    print(f"   ✅ Dropped table: {table_name}")
            
            # Drop any remaining tables
            for table_name in tables:
                if table_name not in drop_order:
                    await conn.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE"))
                    print(f"   ✅ Dropped table: {table_name}")
            
        print("\n✅ All tables dropped successfully!")
        print("💡 Restart the backend to recreate tables automatically.")
        
    except Exception as e:
        print(f"\n❌ Error dropping tables: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(drop_all_tables())

