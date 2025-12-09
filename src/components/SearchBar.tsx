'use client'

import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  resultCount: number
}

export default function SearchBar({ value, onChange, resultCount }: SearchBarProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search links by title, description, domain, notes, or tags..."
        className="block w-full pl-11 pr-32 py-3.5 border border-gray-300/70 dark:border-gray-600 rounded-xl bg-gray-50/90 dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent shadow-sm transition-all duration-200"
      />
      {value && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {resultCount} result{resultCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
}
