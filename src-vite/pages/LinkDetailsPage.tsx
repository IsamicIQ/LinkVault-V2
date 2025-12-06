import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { LinkWithTags } from '@/types/database'
import { formatDate, extractDomain } from '@/lib/utils'
import { ExternalLink, Copy, Edit, Trash2, Calendar, ArrowLeft, X } from 'lucide-react'

export default function LinkDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [link, setLink] = useState<LinkWithTags | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedNotes, setEditedNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [existingTags, setExistingTags] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchLink()
    loadExistingTags()
  }, [id])

  const fetchLink = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('links')
        .select(`
          *,
          link_tags (
            tag:tags (*)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      const formattedLink: LinkWithTags = {
        ...data,
        tags: (data.link_tags || []).map((lt: any) => lt.tag).filter(Boolean),
      }

      setLink(formattedLink)
      setEditedTitle(data.title || '')
      setEditedNotes(data.notes || '')
      setTags((formattedLink.tags || []).map(t => t.name))
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Update link
      const { error: linkError } = await supabase
        .from('links')
        .update({
          title: editedTitle.trim() || null,
          notes: editedNotes.trim() || null,
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (linkError) throw linkError

      // Get old tag IDs before deleting
      const oldTagIds = (link?.tags || []).map(t => t.id)

      // Delete existing link_tags
      const { error: deleteError } = await supabase
        .from('link_tags')
        .delete()
        .eq('link_id', id!)

      if (deleteError) throw deleteError

      // Create/update tags
      const newTagIds: string[] = []
      if (tags.length > 0) {
        for (const tagName of tags) {
          // Check if tag exists
          const { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('user_id', user.id)
            .eq('name', tagName.trim().toLowerCase())
            .single()

          let tagId: string

          if (existingTag) {
            tagId = existingTag.id
          } else {
            // Create new tag
            const { data: newTag, error: tagError } = await supabase
              .from('tags')
              .insert({
                user_id: user.id,
                name: tagName.trim().toLowerCase(),
              })
              .select()
              .single()

            if (tagError) throw tagError
            tagId = newTag.id
          }

          newTagIds.push(tagId)
        }

        // Link tags to link
        if (newTagIds.length > 0) {
          const linkTags = newTagIds.map(tagId => ({
            link_id: id!,
            tag_id: tagId,
          }))

          const { error: linkTagError } = await supabase
            .from('link_tags')
            .insert(linkTags)

          if (linkTagError) throw linkTagError
        }
      }

      // Delete unused tags (tags that were removed and are no longer used)
      const removedTagIds = oldTagIds.filter(id => !newTagIds.includes(id))
      for (const tagId of removedTagIds) {
        const { data: remainingLinks } = await supabase
          .from('link_tags')
          .select('link_id')
          .eq('tag_id', tagId)
          .limit(1)

        // If no links use this tag, delete it
        if (!remainingLinks || remainingLinks.length === 0) {
          await supabase
            .from('tags')
            .delete()
            .eq('id', tagId)
        }
      }

      fetchLink()
      setIsEditing(false)
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this link?')) return

    try {
      // Get the link's tags before deleting
      const tagIds = (link?.tags || []).map(t => t.id)

      // Delete the link
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Check and delete unused tags
      for (const tagId of tagIds) {
        const { data: remainingLinks } = await supabase
          .from('link_tags')
          .select('link_id')
          .eq('tag_id', tagId)
          .limit(1)

        // If no links use this tag, delete it
        if (!remainingLinks || remainingLinks.length === 0) {
          await supabase
            .from('tags')
            .delete()
            .eq('id', tagId)
        }
      }

      navigate('/dashboard')
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleCopy = async () => {
    if (link?.url) {
      await navigator.clipboard.writeText(link.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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

  const suggestedTags = tagInput.trim()
    ? existingTags.filter(t => 
        t.toLowerCase().includes(tagInput.toLowerCase()) && 
        !tags.includes(t)
      ).slice(0, 5)
    : []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error || !link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Link not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-black dark:text-white rounded-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 mb-2"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {link.title || 'Untitled'}
                  </h1>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />
                    {formatDate(link.created_at)}
                  </span>
                  <span>{link.domain || extractDomain(link.url) || 'Unknown domain'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (isEditing) {
                      setIsEditing(false)
                      setEditedTitle(link.title || '')
                      setEditedNotes(link.notes || '')
                      setTags((link.tags || []).map(t => t.name))
                    } else {
                      setIsEditing(true)
                    }
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {/* Description */}
            {isEditing ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={link.description || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  rows={4}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Description is auto-extracted and cannot be edited</p>
              </div>
            ) : (
              link.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  {link.description}
                </p>
              )
            )}

            {/* Tags */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h3>
              {isEditing ? (
                <div>
                  <div className="relative mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type tag and press Enter"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 mb-2"
                  >
                    Add Tag
                  </button>
                  <div className="flex flex-wrap gap-2">
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
                </div>
              ) : (
                link.tags && link.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {link.tags.map(tag => (
                      <span
                        key={tag.id}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No tags</p>
                )
              )}
            </div>

            {/* Notes */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</h3>
              {isEditing ? (
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add your personal notes..."
                />
              ) : (
                link.notes ? (
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    {link.notes}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No notes</p>
                )
              )}
            </div>

            {/* Actions */}
            {isEditing ? (
              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-600 text-black dark:text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditedTitle(link.title || '')
                    setEditedNotes(link.notes || '')
                    setTags((link.tags || []).map(t => t.name))
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-black dark:text-white rounded-lg hover:bg-blue-700"
                >
                  <ExternalLink size={18} />
                  Open Link
                </a>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  <Copy size={18} />
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
