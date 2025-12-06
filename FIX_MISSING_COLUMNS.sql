-- Add missing columns to links table if they don't exist
-- Run this in Supabase SQL Editor

-- Check and add thumbnail_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'links' 
        AND column_name = 'thumbnail_url'
    ) THEN
        ALTER TABLE links ADD COLUMN thumbnail_url TEXT;
    END IF;
END $$;

-- Verify all expected columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'links'
ORDER BY ordinal_position;

