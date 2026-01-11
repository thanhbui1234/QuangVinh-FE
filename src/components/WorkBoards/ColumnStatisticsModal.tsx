import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useStatisticsWorkBoard } from '@/hooks/workBoards/useStatisticsWorkBoard'
import { BarChart3, AlertCircle } from 'lucide-react'
import { GroupStatisticsChart } from './GroupStatisticsChart'
import { NumberStatisticsChart } from './NumberStatisticsChart'
import type { ColumnStatisticsResponse } from '@/types/ColumnStatistics'
import { calculateGroupStatistics, calculateNumberStatistics } from '@/utils/statisticsUtils'

interface ColumnStatisticsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sheetId: number
  columnName: string
  localValues?: string[]
  columnType?: string
}

export const ColumnStatisticsModal: React.FC<ColumnStatisticsModalProps> = ({
  open,
  onOpenChange,
  sheetId,
  columnName,
  localValues,
  columnType,
}) => {
  const { data, isLoading, error } = useStatisticsWorkBoard({
    sheetId,
    columnName,
    enabled: open && !localValues, // Only fetch if we don't have local data
  })

  // Determine stats data source
  let statsData: ColumnStatisticsResponse | undefined

  if (localValues && columnType) {
    if (columnType === 'number') {
      statsData = {
        sheetId,
        columnName,
        template: calculateNumberStatistics(localValues),
      }
    } else {
      // Default to group for text/select/others
      statsData = {
        sheetId,
        columnName,
        template: calculateGroupStatistics(localValues),
      }
    }
  } else {
    statsData = data as ColumnStatisticsResponse | undefined
  }

  // Determine loading/error states for local calculation
  const showLoading = !localValues && isLoading
  const showError = !localValues && error

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 10px;
          transition: background 0.2s;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
        
        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--muted-foreground) / 0.3) transparent;
        }
      `}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Thống kê cột: {columnName}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {showLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-slate-900 rounded-full animate-spin" />
                <p className="text-muted-foreground font-medium mt-4">
                  Đang tải dữ liệu thống kê...
                </p>
              </div>
            ) : showError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-destructive font-medium">Không thể tải dữ liệu thống kê</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {showError instanceof Error ? showError.message : 'Đã xảy ra lỗi khi tải dữ liệu'}
                </p>
              </div>
            ) : !statsData?.template ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">Không có dữ liệu thống kê</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Cột này chưa có dữ liệu để hiển thị thống kê
                </p>
              </div>
            ) : statsData.template.type === 'group' ? (
              <GroupStatisticsChart data={statsData.template} />
            ) : statsData.template.type === 'number' ? (
              <NumberStatisticsChart data={statsData.template} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">Loại dữ liệu không được hỗ trợ</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Loại: {(statsData.template as any).type}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
