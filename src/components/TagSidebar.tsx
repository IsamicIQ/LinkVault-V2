'use client'

import { X, Trash2 } from 'lucide-react'

interface TagSidebarProps {
  tags: { id: string; name: string; count: number }[]
  selectedTag: string | null
  onTagSelect: (tagId: string | null) => void
  onTagDelete?: (tag: { id: string; name: string; count: number }) => void
}

export default function TagSidebar({ tags, selectedTag, onTagSelect, onTagDelete }: TagSidebarProps) {
  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sticky top-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tags</h2>
          {selectedTag && (
            <button
              onClick={() => onTagSelect(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {tags.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No tags yet</p>
          ) : (
            tags.map(tag => (
              <div
                key={tag.id}
                className={`flex items-center gap-2 group ${
                  selectedTag === tag.id
                    ? 'bg-primary-500 text-white shadow-orange-glow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                } rounded-lg transition-all duration-200`}
              >
                <button
                  onClick={() => onTagSelect(selectedTag === tag.id ? null : tag.id)}
                  className="flex-1 text-left px-3 py-2 text-sm"
                >
                  <span className="font-medium">{tag.name}</span>
                  <span className="ml-2 text-xs opacity-75">({tag.count})</span>
                </button>
                {onTagDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onTagDelete(tag)
                    }}
                    className={`px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                      selectedTag === tag.id
                        ? 'hover:bg-primary-600 text-white'
                        : 'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400'
                    } rounded-r-lg`}
                    title="Delete tag"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

