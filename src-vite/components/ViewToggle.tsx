import { Grid3x3, List } from 'lucide-react'

interface ViewToggleProps {
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}

export default function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-2 border border-primary-300 dark:border-gray-600 rounded-lg p-1">
      <button
        onClick={() => onViewModeChange('grid')}
        className={`p-2 rounded ${viewMode === 'grid' 
          ? 'bg-primary-600 text-black dark:text-white' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <Grid3x3 size={20} />
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`p-2 rounded ${viewMode === 'list' 
          ? 'bg-primary-600 text-black dark:text-white' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <List size={20} />
      </button>
    </div>
  )
}

