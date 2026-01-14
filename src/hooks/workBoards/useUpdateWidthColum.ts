import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { workBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'
import SonnerToaster from '@/components/ui/toaster'
import type { IUpdateColumnsRequest, IUpdateColumnsResponse } from '@/types/WorkBoard'
import { handleCommonError } from '@/utils/handleErrors'

// Define options type
interface UseUpdateColumnsOptions {
  suppressInvalidation?: boolean
}

export const useUpdateColumns = (options?: UseUpdateColumnsOptions) => {
  const updateColumnsMutation = useMutation({
    mutationFn: async (payload: IUpdateColumnsRequest): Promise<IUpdateColumnsResponse> => {
      try {
        const response = (await POST(
          API_ENDPOINT.UPDATE_COLUMNS,
          payload
        )) as IUpdateColumnsResponse
        return response
      } catch (error) {
        handleCommonError(error)
        throw error
      }
    },
    onSuccess: (_, variables) => {
      if (!options?.suppressInvalidation) {
        // Invalidate work board detail to refetch
        queryClient.invalidateQueries({ queryKey: workBoardsKey.detail(variables.sheetId) })
        queryClient.invalidateQueries({ queryKey: [workBoardsKey.getAll] })
      }
    },
    onError: (error) => {
      SonnerToaster({
        type: 'error',
        message: 'Lỗi khi cập nhật danh sách cột',
        description:
          error instanceof Error ? error.message : 'Đã xảy ra lỗi khi cập nhật danh sách cột',
      })
    },
  })

  return { updateColumnsMutation }
}

// Mô tả
// API cập nhật độ rộng(width) của sheet.Width được sử dụng để điều chỉnh kích thước hiển thị của sheet.

// Luồng hoạt động
// Validation:
// Kiểm tra actionUserId > 0
// Kiểm tra sheetId > 0
// Permission Check: Kiểm tra user có quyền chỉnh sửa sheet không
// Update Width: Cập nhật width mới cho sheet
// Response: Trả về kết quả boolean
// Width Value
// width: Độ rộng của sheet(số nguyên hoặc số thực)
// Giá trị có thể là:
// Pixel(px): Ví dụ 1200
// Phần trăm(%): Ví dụ 100(tương ứng 100 %)
// Tùy thuộc vào cách frontend sử dụng giá trị này
// Lưu ý
// User phải có quyền chỉnh sửa sheet(trong editableUserIds hoặc là creator)
// Width có thể null hoặc 0 để reset về giá trị mặc định
// Giá trị width được frontend sử dụng để render UI
// Parameters
// Try it out
// No parameters

// Request body

// application / json
// UpdateSheetInfoWidthMsg

// {
//   "data": {
//     "sheetId": 101,
//       "width": 1200
//   }
// }
