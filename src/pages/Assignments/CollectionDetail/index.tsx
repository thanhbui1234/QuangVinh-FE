import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  FileSpreadsheet,
  Calendar,
  FolderOpen,
  Settings,
  Loader2,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useGetDetailColection } from '@/hooks/colection/useGetDetailColection'
import { AddSheetModal } from './components/AddSheetModal'
import { cn } from '@/lib/utils'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import { useDeleteWorkBoardCollection } from '@/hooks/colection/useDeleteWorkBoardCollection'
import useCheckRole from '@/hooks/useCheckRole'
import { DialogConfirm } from '@/components/ui/alertComponent'
import { CollectionSettingsModal } from './components/CollectionSettingsModal'

export const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const collectionId = Number(id)
  const { hasPermission } = useCheckRole()
  const { deleteWorkBoardCollectionMutation } = useDeleteWorkBoardCollection(collectionId)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [deleteSheetId, setDeleteSheetId] = useState<number | null>(null)

  // Hooks
  const { collectionDetail, isFetching: isFetchingDetail } = useGetDetailColection(collectionId)
  const sheets = collectionDetail?.sheets || []

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return 'bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25'
      case 2:
        return 'bg-gray-500/15 text-gray-700 dark:text-gray-400 hover:bg-gray-500/25'
      case 3:
        return 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/25'
      default:
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 hover:bg-blue-500/25'
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return 'Hoạt động'
      case 2:
        return 'Không hoạt động'
      case 3:
        return 'Lưu trữ'
      default:
        return 'Không xác định'
    }
  }

  const handleRemoveSheet = (e: React.MouseEvent, sheetId: number) => {
    e.stopPropagation()
    setDeleteSheetId(sheetId)
  }

  const confirmRemoveSheet = () => {
    if (deleteSheetId) {
      deleteWorkBoardCollectionMutation.mutate(deleteSheetId, {
        onSuccess: () => {
          setDeleteSheetId(null)
        },
      })
    }
  }

  if (!id) return null

  return (
    <div className="h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950/50 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-none p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10"
      >
        <div className="max-w-7xl mx-auto w-full space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Button variant="ghost" size="sm" className="px-2 -ml-2" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Quay lại
            </Button>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-foreground">Chi tiết bộ sưu tập</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            {isFetchingDetail ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {collectionDetail?.name}
                  </h1>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'font-normal border-0',
                      getStatusColor(collectionDetail?.status || 1)
                    )}
                  >
                    {getStatusText(collectionDetail?.status || 1)}
                  </Badge>
                  {hasPermission && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={() => setIsSettingsModalOpen(true)}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Cài đặt
                    </Button>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
                  {collectionDetail?.description || 'Chưa có mô tả'}
                </p>
              </div>
            )}

            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm bảng
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="max-w-7xl mx-auto w-full">
          {isFetchingDetail ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border p-4 space-y-4">
                  <Skeleton className="w-full h-32 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : sheets?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                <FolderOpen className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Bộ sưu tập trống
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2">
                Chưa có bảng công việc nào trong bộ sưu tập này.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm bảng ngay
              </Button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {sheets?.map((sheet: any, index: number) => (
                  <motion.div
                    key={sheet.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => navigate(`/work-boards/${sheet.id}`)}
                    className="group relative bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-primary/20"
                  >
                    {/* Delete Button - Visible on Hover */}
                    <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 shadow-sm"
                        onClick={(e) => handleRemoveSheet(e, sheet.id)}
                        disabled={isFetchingDetail}
                      >
                        {isFetchingDetail ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {/* Visual Header / Icon */}
                    <div className="h-32 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <FileSpreadsheet className="w-12 h-12 text-primary/60 group-hover:text-primary transition-colors" />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-primary transition-colors">
                          {sheet.sheetName}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {sheet.createdTime
                              ? dayjs(sheet.createdTime).locale('vi').format('DD/MM/YYYY')
                              : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {/* User avatars placeholder */}
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900"
                            />
                          ))}
                        </div>
                        <Badge variant="outline" className="text-xs font-normal">
                          {sheet.sheetType === 1 ? 'Công khai' : 'Riêng tư'}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      <DialogConfirm
        open={!!deleteSheetId}
        onOpenChange={(open) => !open && setDeleteSheetId(null)}
        onConfirm={confirmRemoveSheet}
        title="Bạn có chắc chắn muốn xóa bảng khỏi bộ sưu tập?"
        description="Bảng sẽ bị xóa khỏi bộ sưu tập này nhưng vẫn tồn tại trong hệ thống."
      />

      <AddSheetModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        collectionId={collectionId}
      />

      <CollectionSettingsModal
        open={isSettingsModalOpen}
        onOpenChange={setIsSettingsModalOpen}
        initialData={collectionDetail}
      />
    </div>
  )
}
