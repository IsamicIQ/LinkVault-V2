-- Fix title column to allow NULL and set a default value
-- This ensures links can be saved even if title extraction fails

-- Step 1: Make title nullable (remove NOT NULL constraint if it exists)
ALTER TABLE links 
ALTER COLUMN title DROP NOT NULL;

-- Step 2: Set a default value for title
ALTER TABLE links 
ALTER COLUMN title SET DEFAULT 'Untitled Link';

-- Step 3: Update any existing NULL titles to have a default value
UPDATE links 
SET title = COALESCE(title, 'Untitled Link')
WHERE title IS NULL;

