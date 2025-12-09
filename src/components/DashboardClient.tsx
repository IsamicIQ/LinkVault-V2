'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LinkWithTags } from '@/types/database'
import LinkCard from './LinkCard'
import SaveLinkForm from './SaveLinkForm'
import SearchBar from './SearchBar'
import TagPills from './TagPills'
import ViewToggle from './ViewToggle'
import DeleteTagModal from './DeleteTagModal'
import ThemeToggle from './ThemeToggle'
import { LogOut, Plus, RefreshCw } from 'lucide-react'
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
  const [error, setError] = useState<string | null>(null)
  const [tagToDelete, setTagToDelete] = useState<{ id: string; name: string; count: number } | null>(null)
  const [user, setUser] = useState<any>(null)
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
      setLoading(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Auth error:', userError)
        setError(`Authentication error: ${userError.message}`)
        return
      }
      
      if (!user) {
        console.error('No user found')
        setError('You must be logged in to view links')
        return
      }

      setUser(user)

      // Try to load links with tags, but fall back to simple query if relationship doesn't exist
      let linksData, error
      
      try {
        const result = await supabase
          .from('links')
          .select(`
            *,
            link_tags (
              tag:tags (*)
            )
          `)
          .order('created_at', { ascending: false })
        
        linksData = result.data
        error = result.error
      } catch (relError) {
        // If relationship query fails, try simple query
        console.warn('Relationship query failed, trying simple query:', relError)
        const result = await supabase
          .from('links')
          .select('*')
          .order('created_at', { ascending: false })
        
        linksData = result.data
        error = result.error
      }

      if (error) {
        console.error('Supabase error:', error)
        setError(`Error loading links: ${error.message}`)
        throw error
      }

      const formattedLinks: LinkWithTags[] = (linksData || []).map((link: any) => {
        // Handle both relationship query and simple query results
        let tags = []
        if (link.link_tags && Array.isArray(link.link_tags)) {
          tags = link.link_tags.map((lt: any) => lt.tag).filter(Boolean)
        }
        
        return {
          ...link,
          tags: tags,
        }
      })

      setLinks(formattedLinks)
      setError(null) // Clear any previous errors
    } catch (error: any) {
      console.error('Error loading links:', error)
      setError(error.message || 'Failed to load links. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const loadTags = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Try to load tags, but handle if table doesn't exist
      const { data: tagsData, error } = await supabase
        .from('tags')
        .select('*')
        .order('name')

      if (error) {
        // If tags table doesn't exist, just set empty array
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
          console.warn('Tags table not found, skipping tag loading')
          setTags([])
          return
        }
        throw error
      }

      // Get tag counts if link_tags table exists
      let tagCounts: Record<string, number> = {}
      try {
        const { data: linkTagsData } = await supabase
          .from('link_tags')
          .select('tag_id')

        if (linkTagsData) {
          tagCounts = (linkTagsData || []).reduce((acc: Record<string, number>, lt: any) => {
            acc[lt.tag_id] = (acc[lt.tag_id] || 0) + 1
            return acc
          }, {})
        }
      } catch (linkTagError) {
        console.warn('Could not load tag counts:', linkTagError)
      }

      const tagsWithCounts = (tagsData || []).map(tag => ({
        id: tag.id,
        name: tag.name,
        count: tagCounts[tag.id] || 0,
      }))

      setTags(tagsWithCounts)
    } catch (error) {
      console.error('Error loading tags:', error)
      // Set empty tags array on error so app still works
      setTags([])
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl shadow-soft mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading your links...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative" id="dashboard-container">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-50/90 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-300/50 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">LinkVault</h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => {
                  setError(null)
                  loadLinks()
                  loadTags()
                }}
                className="flex items-center justify-center w-10 h-10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                title="Refresh links"
              >
                <RefreshCw size={18} />
              </button>
              <button
                onClick={() => setShowSaveForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-gray-800 dark:text-white rounded-xl hover:from-primary-700 hover:to-primary-800 shadow-orange-glow-sm hover:shadow-orange-glow transition-all duration-200 font-medium"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Link</span>
              </button>
              <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-10 h-10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Controls */}
            <div className="mb-6 space-y-4">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                resultCount={filteredLinks.length}
              />

              {/* Tag Pills */}
              <TagPills
                tags={tags}
                selectedTag={selectedTag}
                onTagSelect={setSelectedTag}
                onTagDelete={setTagToDelete}
              />

              <div className="flex items-center justify-between bg-gray-50/80 dark:bg-gray-800 rounded-xl p-4 border border-gray-300/50 dark:border-gray-700 shadow-sm">
                <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-2 border border-gray-300/70 dark:border-gray-600 rounded-lg bg-gray-50/90 dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Links Grid/List */}
            {filteredLinks.length === 0 ? (
              <div className="text-center py-20 animate-fade-in">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl mb-6">
                  <svg className="w-10 h-10 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  {searchQuery || selectedTag ? 'No links found' : 'No links yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchQuery || selectedTag
                    ? 'Try adjusting your search or filters'
                    : 'Start building your collection by adding your first link'}
                </p>
                {!searchQuery && !selectedTag && (
                  <button
                    onClick={() => setShowSaveForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-700 to-primary-600 text-gray-800 dark:text-white rounded-xl hover:from-primary-800 hover:to-primary-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                  >
                    <Plus size={20} />
                    Add your first link
                  </button>
                )}
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

        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-red-50 dark:bg-red-900/90 backdrop-blur-sm border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-5 py-4 rounded-xl shadow-lg max-w-md">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="flex-shrink-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

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

