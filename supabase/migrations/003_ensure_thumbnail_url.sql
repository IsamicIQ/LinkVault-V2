-- Ensure the thumbnail_url column exists in the links table
-- This migration is idempotent and safe to run multiple times

DO $$
BEGIN
    -- Check if thumbnail_url column exists, if not, add it
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'links'
        AND column_name = 'thumbnail_url'
    ) THEN
        ALTER TABLE links ADD COLUMN thumbnail_url TEXT;
        RAISE NOTICE 'Added thumbnail_url column to links table';
    ELSE
        RAISE NOTICE 'thumbnail_url column already exists in links table';
    END IF;
END $$;
