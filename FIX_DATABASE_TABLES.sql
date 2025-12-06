-- Fix Database Tables and Relationships
-- Run this in Supabase SQL Editor to create all necessary tables and relationships

-- Step 1: Create tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Step 2: Create link_tags junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS link_tags (
  link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (link_id, tag_id)
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_link_tags_link_id ON link_tags(link_id);
CREATE INDEX IF NOT EXISTS idx_link_tags_tag_id ON link_tags(tag_id);

-- Step 4: Enable Row Level Security
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_tags ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies for tags
DROP POLICY IF EXISTS "Users can view their own tags" ON tags;
CREATE POLICY "Users can view their own tags"
  ON tags FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tags" ON tags;
CREATE POLICY "Users can insert their own tags"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tags" ON tags;
CREATE POLICY "Users can update their own tags"
  ON tags FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tags" ON tags;
CREATE POLICY "Users can delete their own tags"
  ON tags FOR DELETE
  USING (auth.uid() = user_id);

-- Step 6: Create RLS Policies for link_tags
DROP POLICY IF EXISTS "Users can view their own link_tags" ON link_tags;
CREATE POLICY "Users can view their own link_tags"
  ON link_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = link_tags.link_id
      AND links.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own link_tags" ON link_tags;
CREATE POLICY "Users can insert their own link_tags"
  ON link_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = link_tags.link_id
      AND links.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own link_tags" ON link_tags;
CREATE POLICY "Users can delete their own link_tags"
  ON link_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = link_tags.link_id
      AND links.user_id = auth.uid()
    )
  );

-- Step 7: Verify tables exist
SELECT 'tags' as table_name, COUNT(*) as row_count FROM tags
UNION ALL
SELECT 'link_tags', COUNT(*) FROM link_tags
UNION ALL
SELECT 'links', COUNT(*) FROM links;

