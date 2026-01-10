import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, FolderOpen, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DialogConfirm } from '@/components/ui/alertComponent'
import { CollectionCard } from './components/CollectionCard'
import { CollectionModal } from './components/CollectionModal'
import { useGetColections } from '@/hooks/colection/useGetColections'
import { useCreateColection } from '@/hooks/colection/useCreatColection'
import { useUpdateColection } from '@/hooks/colection/useUpdateColection'
import { useDeleteColection } from '@/hooks/colection/useDeleteColection'
import type { ICollectionResponse } from '@/types/Collection'
import { useNavigate } from 'react-router-dom'

export const FilterWorkboard = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<ICollectionResponse | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const navigate = useNavigate()
  // API Hooks
  const { colections, isLoading } = useGetColections()
  const { createColectionMutation } = useCreateColection()
  const { updateColectionMutation } = useUpdateColection()
  const { deleteColectionMutation } = useDeleteColection()

  // Filter collections
  const collectionList: any[] = Array.isArray(colections)
    ? colections
    : (colections as any)?.data || []

  const filteredCollections = collectionList.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = (data: any) => {
    createColectionMutation.mutate(data, {
      onSuccess: () => setIsModalOpen(false),
    })
  }

  const handleUpdate = (data: any) => {
    if (editingCollection) {
      updateColectionMutation.mutate(
        { collectionId: editingCollection.id, ...data },
        {
          onSuccess: () => {
            setIsModalOpen(false)
            setEditingCollection(null)
          },
        }
      )
    }
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteColectionMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      })
    }
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight">Bộ sưu tập</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý và tổ chức các bảng công việc của bạn
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-9 bg-white dark:bg-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              setEditingCollection(null)
              setIsModalOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo mới
          </Button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
            <FolderOpen className="h-8 w-8 opacity-50" />
          </div>
          <p>Không tìm thấy bộ sưu tập nào</p>
          {searchTerm && <p className="text-sm">Thử từ khóa khác hoặc tạo mới</p>}
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onEdit={(c) => {
                  setEditingCollection(c)
                  setIsModalOpen(true)
                }}
                onDelete={(id) => setDeleteId(id)}
                onClick={() => {
                  navigate(`/collection/${collection.id}`)
                }}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modals */}
      <CollectionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialData={editingCollection}
        onSubmit={editingCollection ? handleUpdate : handleCreate}
        isSubmitting={createColectionMutation.isPending || updateColectionMutation.isPending}
      />

      <DialogConfirm
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa bộ sưu tập?"
        description="Hành động này sẽ xóa bộ sưu tập này. Các bảng công việc bên trong có thể bị ảnh hưởng."
        confirmLabel={deleteColectionMutation.isPending ? 'Đang xóa...' : 'Xóa'}
        variant="destructive"
      />
    </div>
  )
}
