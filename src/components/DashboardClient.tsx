'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LinkWithTags } from '@/types/database'
import LinkCard from './LinkCard'
import SaveLinkForm from './SaveLinkForm'
import SearchBar from './SearchBar'
import TagSidebar from './TagSidebar'
import ViewToggle from './ViewToggle'
import DeleteTagModal from './DeleteTagModal'
import ThemeToggle from './ThemeToggle'
import { LogOut, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

type SortOption = 'newest' | 'oldest' | 'alphabetical'
type ViewMode = 'grid' | 'list'

export default function DashboardClient() {
  const [links, setLinks] = useState<LinkWithTags[]>([])
  const [filteredLinks, setFilteredLinks] = useState<LinkWithTags[]>([])
  const [tags, setTags] = useState<{ id: string; name: string; count: number }[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tagToDelete, setTagToDelete] = useState<{ id: string; name: string; count: number } | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadLinks()
    loadTags()
  }, [])

  useEffect(() => {
    filterAndSortLinks()
  }, [links, searchQuery, selectedTag, sortBy])

  const loadLinks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: linksData, error } = await supabase
        .from('links')
        .select(`
          *,
          link_tags (
            tag:tags (*)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedLinks: LinkWithTags[] = (linksData || []).map((link: any) => ({
        ...link,
        tags: (link.link_tags || []).map((lt: any) => lt.tag).filter(Boolean),
      }))

      setLinks(formattedLinks)
    } catch (error) {
      console.error('Error loading links:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTags = async () => {
    try {
      const { data: tagsData, error } = await supabase
        .from('tags')
        .select('*')
        .order('name')

      if (error) throw error

      // Get tag counts
      const { data: linkTagsData } = await supabase
        .from('link_tags')
        .select('tag_id')

      const tagCounts = (linkTagsData || []).reduce((acc: Record<string, number>, lt: any) => {
        acc[lt.tag_id] = (acc[lt.tag_id] || 0) + 1
        return acc
      }, {})

      const tagsWithCounts = (tagsData || []).map(tag => ({
        id: tag.id,
        name: tag.name,
        count: tagCounts[tag.id] || 0,
      }))

      setTags(tagsWithCounts)
    } catch (error) {
      console.error('Error loading tags:', error)
    }
  }

  const filterAndSortLinks = () => {
    let filtered = [...links]

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(link =>
        link.tags?.some(tag => tag.id === selectedTag)
      )
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(link => {
        const title = (link.title || '').toLowerCase()
        const description = (link.description || '').toLowerCase()
        const domain = (link.domain || '').toLowerCase()
        const notes = (link.notes || '').toLowerCase()
        const tagNames = (link.tags || []).map(t => t.name.toLowerCase()).join(' ')
        
        return title.includes(query) ||
               description.includes(query) ||
               domain.includes(query) ||
               notes.includes(query) ||
               tagNames.includes(query)
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'alphabetical':
          return (a.title || '').localeCompare(b.title || '')
        default:
          return 0
      }
    })

    setFilteredLinks(filtered)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleLinkSaved = () => {
    loadLinks()
    loadTags()
    setShowSaveForm(false)
  }

  const handleLinkDeleted = () => {
    loadLinks()
    loadTags()
  }

  const handleLinkUpdated = () => {
    loadLinks()
    loadTags()
  }

  const handleTagDeleted = () => {
    loadLinks()
    loadTags()
    // Clear selected tag if it was deleted
    if (tagToDelete && selectedTag === tagToDelete.id) {
      setSelectedTag(null)
    }
    setTagToDelete(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-orange-600 dark:text-white">LinkVault</h1>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={() => setShowSaveForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 shadow-orange-glow-sm transition-all duration-200"
              >
                <Plus size={20} />
                Save Link
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Controls */}
            <div className="mb-6 space-y-4">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                resultCount={filteredLinks.length}
              />
              <div className="flex items-center justify-between">
                <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>

            {/* Links Grid/List */}
            {filteredLinks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery || selectedTag ? 'No links found' : 'No links saved yet. Save your first link!'}
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredLinks.map(link => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    viewMode={viewMode}
                    onDelete={handleLinkDeleted}
                    onUpdate={handleLinkUpdated}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Tag Sidebar */}
          <TagSidebar
            tags={tags}
            selectedTag={selectedTag}
            onTagSelect={setSelectedTag}
            onTagDelete={setTagToDelete}
          />
        </div>
      </div>

      {/* Save Link Modal */}
      {showSaveForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <SaveLinkForm
              onSave={handleLinkSaved}
              onCancel={() => setShowSaveForm(false)}
            />
          </div>
        </div>
      )}

      {/* Delete Tag Modal */}
      {tagToDelete && (
        <DeleteTagModal
          tag={tagToDelete}
          onClose={() => setTagToDelete(null)}
          onDelete={handleTagDeleted}
        />
      )}
    </div>
  )
}

