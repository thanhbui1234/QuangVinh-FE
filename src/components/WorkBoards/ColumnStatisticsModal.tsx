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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto custom-scrollbar border-border/20 bg-background/95 backdrop-blur-md shadow-2xl rounded-3xl">
          <DialogHeader className="border-b border-border/20 pb-4">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground/90">
              <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary/60" />
              </div>
              Thống kê: {columnName}
            </DialogTitle>
          </DialogHeader>

          <div className="py-6">
            {showLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-12 h-12 border-3 border-muted border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
                  Đang tổng hợp dữ liệu...
                </p>
              </div>
            ) : showError ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-20 w-20 rounded-3xl bg-destructive/10 flex items-center justify-center mb-6">
                  <AlertCircle className="h-10 w-10 text-destructive" />
                </div>
                <h3 className="text-lg font-bold mb-2">Không thể tải thống kê</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  {showError instanceof Error
                    ? showError.message
                    : 'Đã xảy ra lỗi khi xử lý dữ liệu'}
                </p>
              </div>
            ) : !statsData?.template ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mb-6">
                  <BarChart3 className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-lg font-bold mb-2">Chưa có dữ liệu</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Cột này hiện đang trống hoặc không có dữ liệu để phân tích
                </p>
              </div>
            ) : statsData.template.type === 'group' ? (
              <GroupStatisticsChart data={statsData.template} />
            ) : statsData.template.type === 'number' ? (
              <NumberStatisticsChart data={statsData.template} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mb-6">
                  <AlertCircle className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-lg font-bold mb-2">Không hỗ trợ</h3>
                <p className="text-muted-foreground text-sm">
                  Kiểu dữ liệu: {(statsData.template as any).type}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
