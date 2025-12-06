import { X, Trash2 } from 'lucide-react'

interface TagPillsProps {
  tags: { id: string; name: string; count: number }[]
  selectedTag: string | null
  onTagSelect: (tagId: string | null) => void
  onTagDelete?: (tag: { id: string; name: string; count: number }) => void
}

export default function TagPills({ tags, selectedTag, onTagSelect, onTagDelete }: TagPillsProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm font-semibold text-gray-800 dark:text-white">Collections:</span>
      {tags.map(tag => (
        <div
          key={tag.id}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 group ${
            selectedTag === tag.id
              ? 'bg-gradient-to-r from-primary-700 to-primary-600 text-gray-800 dark:text-white shadow-sm'
              : 'bg-gray-50/90 dark:bg-gray-700 border-2 border-primary-500 dark:border-primary-400 text-gray-800 dark:text-white hover:border-primary-600 dark:hover:border-primary-300 hover:shadow-sm'
          }`}
        >
          <button
            onClick={() => onTagSelect(selectedTag === tag.id ? null : tag.id)}
            className="flex items-center gap-1.5"
          >
            <span className="font-medium">{tag.name}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              selectedTag === tag.id
                ? 'bg-white/20'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              {tag.count}
            </span>
          </button>
          {selectedTag === tag.id && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onTagSelect(null)
              }}
              className="ml-1 hover:opacity-70 transition-opacity"
            >
              <X size={14} />
            </button>
          )}
          {onTagDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onTagDelete(tag)
              }}
              className={`ml-1 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded p-0.5 ${
                selectedTag === tag.id
                  ? 'text-black dark:text-white hover:bg-white/20'
                  : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
              }`}
              title="Delete collection"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      ))}
      {selectedTag && (
        <button
          onClick={() => onTagSelect(null)}
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          Clear filter
        </button>
      )}
    </div>
  )
}

