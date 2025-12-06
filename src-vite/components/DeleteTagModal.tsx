import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { LinkWithTags } from '@/types/database'
import { X, Trash2 } from 'lucide-react'

interface DeleteTagModalProps {
  tag: { id: string; name: string; count: number }
  onClose: () => void
  onDelete: () => void
}

export default function DeleteTagModal({ tag, onClose, onDelete }: DeleteTagModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [links, setLinks] = useState<LinkWithTags[]>([])
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set())
  const [loadingLinks, setLoadingLinks] = useState(true)

  useEffect(() => {
    loadTagLinks()
  }, [tag.id])

  const loadTagLinks = async () => {
    try {
      setLoadingLinks(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get all links that have this tag
      const { data: linkTagsData, error: linkTagsError } = await supabase
        .from('link_tags')
        .select('link_id')
        .eq('tag_id', tag.id)

      if (linkTagsError) throw linkTagsError

      if (!linkTagsData || linkTagsData.length === 0) {
        setLinks([])
        return
      }

      const linkIds = linkTagsData.map(lt => lt.link_id)

      // Get the full link data
      const { data: linksData, error: linksError } = await supabase
        .from('links')
        .select(`
          *,
          link_tags (
            tag:tags (*)
          )
        `)
        .in('id', linkIds)
        .order('created_at', { ascending: false })

      if (linksError) throw linksError

      const formattedLinks: LinkWithTags[] = (linksData || []).map((link: any) => ({
        ...link,
        tags: (link.link_tags || []).map((lt: any) => lt.tag).filter(Boolean),
      }))

      setLinks(formattedLinks)
      // By default, select all links to keep them
      setSelectedLinks(new Set(formattedLinks.map(link => link.id)))
    } catch (error: any) {
      setError(error.message || 'Failed to load links')
    } finally {
      setLoadingLinks(false)
    }
  }

  const toggleLinkSelection = (linkId: string) => {
    const newSelected = new Set(selectedLinks)
    if (newSelected.has(linkId)) {
      newSelected.delete(linkId)
    } else {
      newSelected.add(linkId)
    }
    setSelectedLinks(newSelected)
  }

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const linksToDelete = links.filter(link => !selectedLinks.has(link.id))
      const linksToKeep = links.filter(link => selectedLinks.has(link.id))

      // Remove the tag from links we're keeping
      if (linksToKeep.length > 0) {
        const keepLinkIds = linksToKeep.map(link => link.id)
        const { error: removeTagError } = await supabase
          .from('link_tags')
          .delete()
          .eq('tag_id', tag.id)
          .in('link_id', keepLinkIds)

        if (removeTagError) throw removeTagError
      }

      // Delete links that weren't selected to keep
      if (linksToDelete.length > 0) {
        const deleteLinkIds = linksToDelete.map(link => link.id)
        
        // First, delete link_tags associations for these links
        const { error: linkTagsError } = await supabase
          .from('link_tags')
          .delete()
          .in('link_id', deleteLinkIds)

        if (linkTagsError) throw linkTagsError

        // Then delete the links themselves
        const { error: deleteLinksError } = await supabase
          .from('links')
          .delete()
          .in('id', deleteLinkIds)
          .eq('user_id', user.id)

        if (deleteLinksError) throw deleteLinksError
      }

      // Finally, delete the tag itself
      const { error: deleteTagError } = await supabase
        .from('tags')
        .delete()
        .eq('id', tag.id)
        .eq('user_id', user.id)

      if (deleteTagError) throw deleteTagError

      onDelete()
      onClose()
    } catch (error: any) {
      setError(error.message || 'Failed to delete tag')
    } finally {
      setLoading(false)
    }
  }

  const linksToDeleteCount = links.length - selectedLinks.size

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-50/95 dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delete Tag</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            Deleting the tag <span className="font-semibold">"{tag.name}"</span> will remove it from all associated links.
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
            ⚠️ You can choose which links to keep below. Unchecked links will be deleted.
          </p>
        </div>

        {loadingLinks ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Loading links...</p>
          </div>
        ) : links.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">No links associated with this tag.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">{selectedLinks.size}</span> link{selectedLinks.size !== 1 ? 's' : ''} will be kept
                {linksToDeleteCount > 0 && (
                  <>
                    {' • '}
                    <span className="font-medium text-red-600 dark:text-red-400">
                      {linksToDeleteCount} link{linksToDeleteCount !== 1 ? 's' : ''} will be deleted
                    </span>
                  </>
                )}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {links.map(link => {
                  const isSelected = selectedLinks.has(link.id)
                  return (
                    <label
                      key={link.id}
                      className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        !isSelected ? 'bg-red-50 dark:bg-red-900/10' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleLinkSelection(link.id)}
                        className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${!isSelected ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                          {link.title || 'Untitled'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{link.url}</p>
                        {link.tags && link.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {link.tags.map(t => (
                              <span
                                key={t.id}
                                className={`text-xs px-2 py-0.5 rounded ${
                                  t.id === tag.id
                                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                    : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                }`}
                              >
                                {t.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || loadingLinks}
            className="px-4 py-2 bg-red-600 text-black dark:text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Trash2 size={18} />
            {loading ? 'Deleting...' : `Delete Tag${linksToDeleteCount > 0 ? ` (${linksToDeleteCount} links)` : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

