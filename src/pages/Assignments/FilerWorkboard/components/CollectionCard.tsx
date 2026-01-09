import React from 'react'
import { motion } from 'framer-motion'
import { Folder, MoreVertical, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { ICollectionResponse } from '@/types/Collection'
import { cn } from '@/lib/utils'

interface CollectionCardProps {
  collection: ICollectionResponse
  onEdit: (collection: ICollectionResponse) => void
  onDelete: (id: number) => void
  onClick?: (collection: ICollectionResponse) => void
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onEdit,
  onDelete,
  onClick,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.05, rotate: 1 }}
      className="group relative cursor-pointer"
      onClick={() => onClick?.(collection)}
    >
      {/* Folder Tab (Top Left) */}
      <div
        className={cn(
          'absolute top-0 left-0 w-1/3 h-8 rounded-t-lg border-t border-l border-r',
          'bg-blue-50 dark:bg-slate-800 border-blue-100 dark:border-slate-700',
          'group-hover:bg-blue-100 dark:group-hover:bg-slate-700 transition-colors'
        )}
      />

      {/* Main Folder Body */}
      <div
        className={cn(
          'relative mt-4 overflow-hidden rounded-tr-xl rounded-b-xl rounded-bl-sm border',
          'bg-card shadow-sm transition-all hover:shadow-xl',
          'dark:bg-slate-900/80 bg-white',
          'h-[180px] flex flex-col' // Fixed height for consistency
        )}
      >
        {/* Top bar with folder icon color stripe or similar */}
        <div className="h-2 w-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors" />

        <div className="p-5 flex flex-col h-full">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Folder className="h-6 w-6 fill-current" />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(collection)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(collection.id)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">{collection.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {collection.description || 'Chưa có mô tả'}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 mt-auto">
            <span
              className={cn(
                'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
                collection.status === 1
                  ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400'
                  : collection.status === 2
                    ? 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-800 dark:text-gray-400'
                    : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-900/20 dark:text-yellow-400'
              )}
            >
              {collection.status === 1
                ? 'Hoạt động'
                : collection.status === 2
                  ? 'Không hoạt động'
                  : 'Lưu trữ'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
