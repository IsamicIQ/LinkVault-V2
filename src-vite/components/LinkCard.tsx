import { LinkWithTags } from '@/types/database'
import { formatDate, extractDomain } from '@/lib/utils'
import { ExternalLink, Edit, Trash2, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface LinkCardProps {
  link: LinkWithTags
  viewMode: 'grid' | 'list'
  onDelete: (id: string) => void
  searchQuery?: string
}

export default function LinkCard({ link, viewMode, onDelete, searchQuery = '' }: LinkCardProps) {
  const navigate = useNavigate()

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark>
      ) : part
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="group bg-gray-50/90 dark:bg-gray-800 rounded-xl border border-gray-300/50 dark:border-gray-700 p-5 hover:shadow-card-hover hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors block"
                >
                  {searchQuery ? highlightText(link.title || 'Untitled', searchQuery) : (link.title || 'Untitled')}
                </a>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                  {link.domain || extractDomain(link.url) || 'Unknown domain'}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">
                  {link.notes ? (
                    searchQuery ? highlightText(link.notes, searchQuery) : link.notes
                  ) : (
                    <span className="italic text-gray-400 dark:text-gray-500">No notes</span>
                  )}
                </p>
                {link.tags && link.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {link.tags.map(tag => (
                      <span
                        key={tag.id}
                        className="px-2.5 py-1 bg-primary-100 dark:bg-primary-900/40 border-2 border-primary-500 dark:border-primary-400 text-gray-800 dark:text-white text-xs font-medium rounded-lg"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    {formatDate(link.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => navigate(`/links/${link.id}`)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this link?')) {
                      onDelete(link.id)
                    }
                  }}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group bg-gray-50/90 dark:bg-gray-800 rounded-xl border border-gray-300/50 dark:border-gray-700 overflow-hidden hover:shadow-card-hover hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 animate-scale-in">
      <div className="p-5">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors block mb-2 line-clamp-2"
          onClick={(e) => e.stopPropagation()}
        >
          {searchQuery ? highlightText(link.title || 'Untitled', searchQuery) : (link.title || 'Untitled')}
        </a>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
          {link.domain || extractDomain(link.url) || 'Unknown domain'}
        </p>
        {link.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
            {searchQuery ? highlightText(link.description, searchQuery) : link.description}
          </p>
        )}
        {link.tags && link.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {link.tags.map(tag => (
              <span
                key={tag.id}
                className="px-2.5 py-1 bg-primary-100 dark:bg-primary-900/40 border-2 border-primary-500 dark:border-primary-400 text-gray-800 dark:text-white text-xs font-medium rounded-lg"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Calendar size={12} />
            {formatDate(link.created_at)}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => navigate(`/links/${link.id}`)}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Edit"
            >
              <ExternalLink size={16} />
            </button>
            <button
              onClick={() => {
                if (confirm('Delete this link?')) {
                  onDelete(link.id)
                }
              }}
              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

