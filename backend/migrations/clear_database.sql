-- Script to completely clear all data from the database
-- WARNING: This will delete ALL data from ALL tables!
-- Use with caution!

-- Disable foreign key checks temporarily (PostgreSQL doesn't need this, but for clarity)
-- Delete data from all tables in correct order (respecting foreign keys)

-- Delete from dependent tables first
DELETE FROM contributions;
DELETE FROM reservations;
DELETE FROM items;
DELETE FROM friendships;
DELETE FROM wishlists;
DELETE FROM users;

-- Reset sequences if any (PostgreSQL auto-increment)
-- Note: UUID primary keys don't use sequences, but if you have any serial columns, reset them here

-- Verify tables are empty
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
SELECT 'friendships', COUNT(*) FROM friendships;

