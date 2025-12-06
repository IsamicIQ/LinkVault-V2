import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchLinkMetadata } from '@/lib/link-metadata'
import { extractDomain } from '@/lib/utils'
import { X } from 'lucide-react'

interface SaveLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function SaveLinkModal({ isOpen, onClose, onSave }: SaveLinkModalProps) {
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingTags, setExistingTags] = useState<string[]>([])

  // Load existing tags for auto-suggest
  const loadExistingTags = async () => {
    try {
      const { data } = await supabase
        .from('tags')
        .select('name')
        .order('name')
      
      if (data) {
        setExistingTags(data.map(t => t.name))
      }
    } catch (error) {
      console.error('Error loading tags:', error)
    }
  }

  if (isOpen && existingTags.length === 0) {
    loadExistingTags()
  }

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
      const insertData: any = {
        url: validUrl,
        user_id: user.id,
        title: initialTitle,
        description: null,
        thumbnail_url: null,
      }

      if (domain) insertData.domain = domain
      if (notes.trim()) insertData.notes = notes.trim()

      const { data: linkData, error: linkError } = await supabase
        .from('links')
        .insert(insertData)
        .select()
        .single()

      if (linkError) {
        console.error('Error inserting link:', linkError)
        throw linkError
      }

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
          .catch(err => console.error('Failed to update metadata:', err))
      }).catch(err => console.error('Failed to fetch metadata:', err))

      // Reset form
      setUrl('')
      setNotes('')
      setTags([])
      setTagInput('')
      setError(null)
      
      // Close modal first
      onClose()
      
      // Then trigger save callback to refresh links
      // Use setTimeout to ensure modal closes first
      setTimeout(() => {
        onSave()
      }, 100)
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

  // Filter existing tags based on input
  const suggestedTags = tagInput.trim()
    ? existingTags.filter(t => 
        t.toLowerCase().includes(tagInput.toLowerCase()) && 
        !tags.includes(t)
      ).slice(0, 5)
    : []

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-50/95 dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Save Link</h2>
          <button
            onClick={onClose}
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
              className="w-full px-3 py-2 border border-gray-300/70 dark:border-gray-600 rounded-lg bg-gray-50/90 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300/70 dark:border-gray-600 rounded-lg bg-gray-50/90 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (optional)
            </label>
            <div className="relative">
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type tag and press Enter"
                className="w-full px-3 py-2 border border-gray-300/70 dark:border-gray-600 rounded-lg bg-gray-50/90 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {suggestedTags.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                  {suggestedTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (!tags.includes(tag)) {
                          setTags([...tags, tag])
                          setTagInput('')
                        }
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddTag}
              className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Add Tag
            </button>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
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
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-4 py-2 bg-blue-600 text-black dark:text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

