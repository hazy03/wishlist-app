"""
Script to completely clear all data from the database.
WARNING: This will delete ALL data from ALL tables!
"""
import asyncio
from sqlalchemy import text
from app.db.session import engine
from app.core.config import settings


async def clear_database():
    """Clear all data from all tables."""
    print("⚠️  WARNING: This will delete ALL data from the database!")
    print(f"📋 Database: {settings.DATABASE_URL[:80]}...")
    
    confirmation = input("\n❓ Are you sure you want to proceed? Type 'YES' to confirm: ")
    if confirmation != "YES":
        print("❌ Operation cancelled.")
        return
    
    try:
        async with engine.begin() as conn:
            print("\n🗑️  Deleting data from tables...")
            
            # Delete from dependent tables first
            await conn.execute(text("DELETE FROM contributions"))
            print("   ✅ contributions cleared")
            
            await conn.execute(text("DELETE FROM reservations"))
            print("   ✅ reservations cleared")
            
            await conn.execute(text("DELETE FROM items"))
            print("   ✅ items cleared")
            
            await conn.execute(text("DELETE FROM friendships"))
            print("   ✅ friendships cleared")
            
            await conn.execute(text("DELETE FROM wishlists"))
            print("   ✅ wishlists cleared")
            
            await conn.execute(text("DELETE FROM users"))
            print("   ✅ users cleared")
            
        print("\n✅ Database cleared successfully!")
        
        # Verify tables are empty
        async with engine.connect() as conn:
            result = await conn.execute(text("""
                SELECT 
                    'users' as table_name, COUNT(*) as row_count FROM users
                UNION ALL
                SELECT 'wishlists', COUNT(*) FROM wishlists
                UNION ALL
                SELECT 'items', COUNT(*) FROM items
                UNION ALL
                SELECT 'reservations', COUNT(*) FROM reservations
                UNION ALL
                SELECT 'contributions', COUNT(*) FROM contributions
                UNION ALL
                SELECT 'friendships', COUNT(*) FROM friendships
            """))
            
            print("\n📊 Verification:")
            for row in result:
                print(f"   {row[0]}: {row[1]} rows")
                
    except Exception as e:
        print(f"\n❌ Error clearing database: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(clear_database())

