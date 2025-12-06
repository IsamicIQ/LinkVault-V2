-- Add missing columns to the links table
-- Run this in Supabase SQL Editor

-- Add thumbnail_url column if it doesn't exist
ALTER TABLE links 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add domain column if it doesn't exist
ALTER TABLE links 
ADD COLUMN IF NOT EXISTS domain TEXT;

-- Add notes column if it doesn't exist
ALTER TABLE links 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add description column if it doesn't exist
ALTER TABLE links 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Verify columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'links'
ORDER BY ordinal_position;

