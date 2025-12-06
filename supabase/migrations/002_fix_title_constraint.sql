-- Fix title column to allow NULL or set a default
-- This migration ensures title can be NULL, but we'll always provide a value in the app

-- First, check if title has a NOT NULL constraint and remove it if it exists
DO $$ 
BEGIN
    -- Check if column exists and has NOT NULL constraint
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'links' 
        AND column_name = 'title'
        AND is_nullable = 'NO'
    ) THEN
        -- Make title nullable
        ALTER TABLE links ALTER COLUMN title DROP NOT NULL;
    END IF;
END $$;

-- Set a default value for title if it's NULL (as a safety measure)
-- This ensures even if somehow a NULL gets through, it has a default
ALTER TABLE links ALTER COLUMN title SET DEFAULT 'Untitled Link';

-- Update any existing NULL titles to have a default value
UPDATE links 
SET title = COALESCE(title, url, 'Untitled Link')
WHERE title IS NULL;

