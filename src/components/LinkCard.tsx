'use client'

import { LinkWithTags } from '@/types/database'
import { formatDate, extractDomain } from '@/lib/utils'
import { ExternalLink, Edit, Trash2, Calendar } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import EditLinkModal from './EditLinkModal'
import DeleteLinkModal from './DeleteLinkModal'

interface LinkCardProps {
  link: LinkWithTags
  viewMode: 'grid' | 'list'
  onDelete: () => void
  onUpdate: () => void
}

export default function LinkCard({ link, viewMode, onDelete, onUpdate }: LinkCardProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  if (viewMode === 'list') {
    return (
      <>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline block"
                  >
                    {link.title || 'Untitled'}
                  </a>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {link.domain || extractDomain(link.url)}
                  </p>
                  {link.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                      {link.description}
                    </p>
                  )}
                  {link.tags && link.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {link.tags.map(tag => (
                        <span
                          key={tag.id}
                          className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(link.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showEditModal && (
          <EditLinkModal
            link={link}
            onClose={() => setShowEditModal(false)}
            onUpdate={onUpdate}
          />
        )}

        {showDeleteModal && (
          <DeleteLinkModal
            link={link}
            onClose={() => setShowDeleteModal(false)}
            onDelete={onDelete}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
        <div className="p-4">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline block mb-2 line-clamp-2"
          >
            {link.title || 'Untitled'}
          </a>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {link.domain || extractDomain(link.url)}
          </p>
          {link.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
              {link.description}
            </p>
          )}
          {link.tags && link.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {link.tags.map(tag => (
                <span
                  key={tag.id}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(link.created_at)}
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={`/links/${link.id}`}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <ExternalLink size={16} />
              </Link>
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditLinkModal
          link={link}
          onClose={() => setShowEditModal(false)}
          onUpdate={onUpdate}
        />
      )}

      {showDeleteModal && (
        <DeleteLinkModal
          link={link}
          onClose={() => setShowDeleteModal(false)}
          onDelete={onDelete}
        />
      )}
    </>
  )
}

