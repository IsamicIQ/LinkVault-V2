import { X } from 'lucide-react'

interface TagSidebarProps {
  tags: { id: string; name: string; count: number }[]
  selectedTag: string | null
  onTagSelect: (tagId: string | null) => void
}

export default function TagSidebar({ tags, selectedTag, onTagSelect }: TagSidebarProps) {
  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-gray-50/90 dark:bg-gray-800 rounded-lg shadow p-4 sticky top-4">
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
              <button
                key={tag.id}
                onClick={() => onTagSelect(selectedTag === tag.id ? null : tag.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedTag === tag.id
                    ? 'bg-blue-600 text-black dark:text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="font-medium">{tag.name}</span>
                <span className="ml-2 text-xs opacity-75">({tag.count})</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

