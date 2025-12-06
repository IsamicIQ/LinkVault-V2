'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LinkWithTags } from '@/types/database'
import { X, Trash2 } from 'lucide-react'

interface DeleteLinkModalProps {
  link: LinkWithTags
  onClose: () => void
  onDelete: () => void
}

export default function DeleteLinkModal({ link, onClose, onDelete }: DeleteLinkModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: deleteError } = await supabase
        .from('links')
        .delete()
        .eq('id', link.id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      onDelete()
      onClose()
    } catch (error: any) {
      setError(error.message || 'Failed to delete link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delete Link</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to delete this link? This action cannot be undone.
        </p>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-6">
          <p className="font-medium text-gray-900 dark:text-white">{link.title || 'Untitled'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{link.url}</p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Trash2 size={18} />
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

