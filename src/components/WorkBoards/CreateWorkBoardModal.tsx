import React, { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Lock, Shield } from 'lucide-react'
// import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
import { useGetAllUsers } from '@/hooks/personnel/useGetAllUsers'
import useCheckRole from '@/hooks/useCheckRole'
import type { CreateSheetPayload, SheetColumn } from '@/types/Sheet'
import type { PersonnelUser } from '@/types/Personnel'

interface CreateWorkBoardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateSheetPayload) => void
  isSubmitting?: boolean
}

// const COLUMN_TYPES: { label: string; value: SheetColumnType }[] = [
//   { value: 'text', label: 'Văn bản' },
//   { value: 'number', label: 'Số' },
//   { value: 'select', label: 'Lựa chọn' },
// ]

// interface ColumnConfigRowProps {
//   column: SheetColumn
//   onChange: (column: SheetColumn) => void
//   onRemove: () => void
//   disabled?: boolean
// }

// const ColumnConfigRow: React.FC<ColumnConfigRowProps> = ({
//   column,
//   onChange,
//   onRemove,
//   disabled = false,
// }) => {
//   const [optionsInput, setOptionsInput] = useState(column.options.join(', '))

//   const handleOptionsBlur = () => {
//     const parsed =
//       optionsInput
//         .split(',')
//         .map((item) => item.trim())
//         .filter(Boolean) || []
//     onChange({ ...column, options: parsed })
//   }

//   return (
//     <div className="space-y-3 rounded-lg border p-3 bg-muted/30">
//       <div className="flex items-center gap-3">
//         <div className="flex-1 space-y-1">
//           <Label className="text-xs text-muted-foreground">Tên cột</Label>
//           <Input
//             value={column.name}
//             onChange={(e) => onChange({ ...column, name: e.target.value })}
//             placeholder="Ví dụ: Tên, Tuổi, Phòng ban..."
//             disabled={disabled}
//           />
//         </div>
//         <div className="w-[140px] space-y-1">
//           <Label className="text-xs text-muted-foreground">Kiểu dữ liệu</Label>
//           <select
//             className="h-9 w-full rounded-md border bg-background px-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//             value={column.type}
//             onChange={(e) => onChange({ ...column, type: e.target.value as SheetColumnType })}
//             disabled={disabled}
//           >
//             {COLUMN_TYPES.map((type) => (
//               <option key={type.value} value={type.value}>
//                 {type.label}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div className="w-[90px] space-y-1">
//           <Label className="text-xs text-muted-foreground">Màu</Label>
//           <Input
//             type="color"
//             value={column.color}
//             onChange={(e) => onChange({ ...column, color: e.target.value })}
//             className="h-9 px-1"
//             disabled={disabled}
//           />
//         </div>
//         <div className="w-[110px] flex flex-col items-start justify-center gap-1">
//           <Label className="text-xs text-muted-foreground">Bắt buộc</Label>
//           <div className="flex items-center gap-2">
//             <Switch
//               checked={column.required}
//               onCheckedChange={(checked) => onChange({ ...column, required: checked })}
//               className="scale-90"
//               disabled={disabled}
//             />
//             <span className="text-xs text-muted-foreground">
//               {column.required ? 'Có' : 'Không'}
//             </span>
//           </div>
//         </div>
//         <Button type="button" variant="ghost" size="icon" onClick={onRemove} disabled={disabled}>
//           ✕
//         </Button>
//       </div>

//       {column.type === 'select' && (
//         <div className="space-y-1">
//           <Label className="text-xs text-muted-foreground">Tùy chọn (ngăn cách bởi dấu phẩy)</Label>
//           <Input
//             value={optionsInput}
//             onChange={(e) => setOptionsInput(e.target.value)}
//             onBlur={handleOptionsBlur}
//             placeholder="Ví dụ: IT, HR, Finance, Marketing"
//             disabled={disabled}
//           />
//           {column.options.length > 0 && (
//             <div className="flex flex-wrap gap-1 pt-1">
//               {column.options.map((opt) => (
//                 <Badge key={opt} variant="outline" className="text-xs">
//                   {opt}
//                 </Badge>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

interface UserPermissionSelectorProps {
  allUsers: PersonnelUser[]
  viewableUserIds: number[]
  editableUserIds: number[]
  onChangeViewable: (ids: number[]) => void
  onChangeEditable: (ids: number[]) => void
  disabled?: boolean
}

const UserPermissionSelector: React.FC<UserPermissionSelectorProps> = ({
  allUsers,
  viewableUserIds,
  editableUserIds,
  onChangeViewable,
  onChangeEditable,
  disabled = false,
}) => {
  const toggleId = (ids: number[], id: number, onChange: (next: number[]) => void) => {
    if (ids.includes(id)) {
      onChange(ids.filter((item) => item !== id))
    } else {
      onChange([...ids, id])
    }
  }

  const usersSorted = useMemo(
    () =>
      [...allUsers].sort((a, b) => {
        const nameA = (a.name || a.email || '').toLowerCase()
        const nameB = (b.name || b.email || '').toLowerCase()
        return nameA.localeCompare(nameB)
      }),
    [allUsers]
  )

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Người được xem</Label>
        <div className="rounded-md border bg-muted/30">
          <div className="h-52 overflow-y-auto">
            <div className="p-2 space-y-1">
              {usersSorted.map((user) => {
                const checked = viewableUserIds.includes(user.id)
                const displayName = user.name || user.email
                return (
                  <button
                    key={user.id}
                    type="button"
                    className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed ${
                      checked ? 'bg-muted' : ''
                    }`}
                    onClick={() => toggleId(viewableUserIds, user.id, onChangeViewable)}
                    disabled={disabled}
                  >
                    <span className="truncate">{displayName}</span>
                    {checked && <Badge variant="secondary">Xem</Badge>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Người được chỉnh sửa</Label>
        <div className="rounded-md border bg-muted/30">
          <div className="h-52 overflow-y-auto">
            <div className="p-2 space-y-1">
              {usersSorted.map((user) => {
                const checked = editableUserIds.includes(user.id)
                const displayName = user.name || user.email
                return (
                  <button
                    key={user.id}
                    type="button"
                    className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed ${
                      checked ? 'bg-muted' : ''
                    }`}
                    onClick={() => toggleId(editableUserIds, user.id, onChangeEditable)}
                    disabled={disabled}
                  >
                    <span className="truncate">{displayName}</span>
                    {checked && <Badge variant="secondary">Sửa</Badge>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const CreateWorkBoardModal: React.FC<CreateWorkBoardModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}) => {
  const [sheetName, setSheetName] = useState('')
  const [sheetType, setSheetType] = useState<string>('1')
  const [columns, setColumns] = useState<SheetColumn[]>([])
  const [viewableUserIds, setViewableUserIds] = useState<number[]>([])
  const [editableUserIds, setEditableUserIds] = useState<number[]>([])

  const { allUsers, isFetching: isLoadingUsers } = useGetAllUsers(open)
  const { isManagerPermission } = useCheckRole()

  // const handleAddColumn = () => {
  //   setColumns((prev) => [
  //     ...prev,
  //     {
  //       name: '',
  //       type: 'text',
  //       index: prev.length,
  //       color: '#FFFFFF',
  //       required: false,
  //       options: [],
  //     },
  //   ])
  // }

  // const handleChangeColumn = (index: number, next: SheetColumn) => {
  //   setColumns((prev) => prev.map((col, i) => (i === index ? { ...next, index } : col)))
  // }

  // const handleRemoveColumn = (index: number) => {
  //   setColumns((prev) =>
  //     prev
  //       .filter((_, i) => i !== index)
  //       .map((col, i) => ({
  //         ...col,
  //         index: i,
  //       }))
  //   )
  // }

  const resetState = () => {
    setSheetName('')
    setSheetType('1')
    setColumns([])
    setViewableUserIds([])
    setEditableUserIds([])
  }

  const handleClose = () => {
    resetState()
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isManagerPermission) {
      return
    }

    const trimmedColumns = columns
      .map((col, idx) => ({
        ...col,
        name: col.name.trim(),
        index: idx,
      }))
      .filter((col) => col.name.length > 0)

    const payload: CreateSheetPayload = {
      sheetName: sheetName.trim(),
      sheetType: Number(sheetType),
      columns: trimmedColumns,
      viewableUserIds: Number(sheetType) === 2 ? viewableUserIds : [],
      editableUserIds: Number(sheetType) === 2 ? editableUserIds : [],
    }

    onSubmit(payload)
  }

  const isValid = isManagerPermission && sheetName.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-5 pb-3 border-b">
          <DialogTitle>Tạo bảng dữ liệu mới</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Định nghĩa cấu trúc cột và phân quyền cho bảng dữ liệu của bạn.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 px-6 py-5">
              {!isManagerPermission && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-800">
                    Chỉ có Manager hoặc Director mới có quyền tạo bảng dữ liệu.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sheetName">Tên bảng *</Label>
                  <Input
                    id="sheetName"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    placeholder="Ví dụ: Danh sách nhân viên"
                    required
                    disabled={!isManagerPermission}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Loại bảng</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={cn(
                        'cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:bg-muted/50',
                        sheetType === '1'
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent bg-muted/30'
                      )}
                      onClick={() => isManagerPermission && setSheetType('1')}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            'rounded-full p-2.5 mt-0.5',
                            sheetType === '1'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          <Globe className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p
                            className={cn(
                              'font-medium',
                              sheetType === '1' ? 'text-primary' : 'text-foreground'
                            )}
                          >
                            Public
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Công khai, mọi thành viên trong hệ thống đều có thể tìm thấy và xem nội
                            dung bảng này.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        'cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:bg-muted/50',
                        sheetType === '2'
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent bg-muted/30'
                      )}
                      onClick={() => isManagerPermission && setSheetType('2')}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            'rounded-full p-2.5 mt-0.5',
                            sheetType === '2'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          <Lock className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p
                            className={cn(
                              'font-medium',
                              sheetType === '2' ? 'text-primary' : 'text-foreground'
                            )}
                          >
                            Private
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Riêng tư, chỉ những người được cấp quyền mới có thể truy cập và xem nội
                            dung.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <AnimatePresence>
                {sheetType === '2' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            Phân quyền truy cập
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Lựa chọn thành viên có quyền xem hoặc chỉnh sửa dữ liệu.
                          </p>
                        </div>
                        {isLoadingUsers && (
                          <span className="text-xs text-accent-foreground animate-pulse">
                            Đang tải danh sách...
                          </span>
                        )}
                      </div>

                      <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <UserPermissionSelector
                          allUsers={allUsers}
                          viewableUserIds={viewableUserIds}
                          editableUserIds={editableUserIds}
                          onChangeViewable={setViewableUserIds}
                          onChangeEditable={setEditableUserIds}
                          disabled={!isManagerPermission}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t px-6 py-3">
            <div className="text-xs text-muted-foreground">
              {columns.length} cột • {viewableUserIds.length} người được xem •{' '}
              {editableUserIds.length} người được chỉnh sửa
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting || !isValid}>
                {isSubmitting ? 'Đang tạo...' : 'Tạo bảng'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
