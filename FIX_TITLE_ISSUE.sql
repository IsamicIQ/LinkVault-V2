-- Simple SQL to fix the title constraint issue
-- Copy and paste this into Supabase SQL Editor and run it

-- Step 1: Make title nullable (remove NOT NULL constraint)
ALTER TABLE links 
ALTER COLUMN title DROP NOT NULL;

-- Step 2: Set a default value
ALTER TABLE links 
ALTER COLUMN title SET DEFAULT 'Untitled Link';

-- Step 3: Update any existing NULL titles
UPDATE links 
SET title = COALESCE(title, 'Untitled Link')
WHERE title IS NULL;

