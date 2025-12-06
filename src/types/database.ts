export interface Link {
  id: string
  user_id: string
  url: string
  title: string | null
  description: string | null
  thumbnail_url: string | null
  domain: string | null
  notes: string | null
  created_at: string
  updated_at: string
  tags?: Tag[]
}

export interface Tag {
  id: string
  user_id: string
  name: string
  created_at: string
  link_count?: number
}

export interface LinkTag {
  link_id: string
  tag_id: string
}

export interface LinkWithTags extends Link {
  tags: Tag[]
}

