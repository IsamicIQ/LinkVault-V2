'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { extractDomain } from '@/lib/utils'
import { fetchLinkMetadata } from '@/lib/link-metadata'
import { X } from 'lucide-react'

interface SaveLinkFormProps {
  onSave: () => void
  onCancel: () => void
}

export default function SaveLinkForm({ onSave, onCancel }: SaveLinkFormProps) {
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Validate URL
      let validUrl = url.trim()
      if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
        validUrl = 'https://' + validUrl
      }

      const domain = extractDomain(validUrl)
      // Use domain as initial title - metadata will be fetched in background
      const initialTitle = domain || validUrl.length > 50 ? validUrl.substring(0, 50) + '...' : validUrl

      // Save link immediately with basic info
      const { data: linkData, error: linkError } = await supabase
        .from('links')
        .insert({
          user_id: user.id,
          url: validUrl,
          title: initialTitle,
          description: null,
          thumbnail_url: null,
          domain,
          notes: notes.trim() || null,
        })
        .select()
        .single()

      if (linkError) throw linkError

      // Process tags in parallel
      if (tags.length > 0) {
        const tagNames = tags.map(t => t.trim().toLowerCase())
        
        // Get all existing tags in one query
        const { data: existingTags } = await supabase
          .from('tags')
          .select('id, name')
          .eq('user_id', user.id)
          .in('name', tagNames)

        const existingTagMap = new Map((existingTags || []).map(t => [t.name, t.id]))
        const tagsToCreate = tagNames.filter(name => !existingTagMap.has(name))

        // Create missing tags in parallel
        if (tagsToCreate.length > 0) {
          const newTags = tagsToCreate.map(name => ({
            user_id: user.id,
            name,
          }))
          
          const { data: createdTags, error: createError } = await supabase
            .from('tags')
            .insert(newTags)
            .select()

          if (createError) throw createError
          
          // Add new tags to the map
          createdTags?.forEach(tag => existingTagMap.set(tag.name, tag.id))
        }

        // Link all tags at once
        const linkTags = tagNames
          .map(name => existingTagMap.get(name))
          .filter(Boolean)
          .map(tagId => ({
            link_id: linkData.id,
            tag_id: tagId!,
          }))

        if (linkTags.length > 0) {
          const { error: linkTagError } = await supabase
            .from('link_tags')
            .insert(linkTags)

          if (linkTagError) throw linkTagError
        }
      }

      // Fetch metadata in background and update link
      fetchLinkMetadata(validUrl).then(metadata => {
        supabase
          .from('links')
          .update({
            title: metadata.title || initialTitle,
            description: metadata.description,
            thumbnail_url: metadata.thumbnailUrl,
          })
          .eq('id', linkData.id)
          .then(({ error }) => {
            if (error) console.error('Failed to update metadata:', error)
          })
          .catch(err => console.error('Failed to update metadata:', err))
      }).catch(err => console.error('Failed to fetch metadata:', err))

      onSave()
    } catch (error: any) {
      setError(error.message || 'Failed to save link')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Save Link</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL
          </label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your personal notes..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags (optional)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type tag and press Enter"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 shadow-orange-glow-sm transition-all duration-200"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-primary-900 dark:hover:text-primary-100"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 shadow-orange-glow-sm transition-all duration-200"
          >
            {loading ? 'Saving...' : 'Save Link'}
          </button>
        </div>
      </form>
    </div>
  )
}

