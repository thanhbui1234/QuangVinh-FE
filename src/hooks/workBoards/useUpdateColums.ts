import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { workBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'
import SonnerToaster from '@/components/ui/toaster'
import type { IUpdateColumnRequest, IUpdateColumnResponse } from '@/types/WorkBoard'
import { handleCommonError } from '@/utils/handleErrors'

// Define options type
interface UseUpdateColumnOptions {
  suppressInvalidation?: boolean
}

export const useUpdateColumns = (options?: UseUpdateColumnOptions) => {
  const updateColumnsMutation = useMutation({
    mutationFn: async (payload: IUpdateColumnRequest): Promise<IUpdateColumnResponse> => {
      try {
        const response = (await POST(API_ENDPOINT.UPDATE_COLUMN, payload)) as IUpdateColumnResponse
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
        message: 'Lỗi khi cập nhật cột',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi cập nhật cột',
      })
    },
  })

  return { updateColumnsMutation }
}
// how to use

// Mô tả
// API cập nhật thông tin của nhiều cột trong sheet(tên, loại, màu sắc, required, options, index).

// Luồng hoạt động
// Validation:
// Kiểm tra actionUserId > 0
// Kiểm tra columnName không rỗng
// Kiểm tra msg không null
// Permission Check: Kiểm tra user có quyền chỉnh sửa sheet không
// Find Column: Tìm column có tên tương ứng
// Update Column: Cập nhật các thuộc tính:
// name(nếu newColumnName khác với tên hiện tại)
// type(nếu newType khác)
// color(nếu newColor khác)
// required(nếu khác)
// options(nếu newOptions không rỗng)
// index(nếu newIndex khác)
// Response: Trả về kết quả boolean
// Lưu ý
// User phải có quyền chỉnh sửa sheet(trong editableUserIds hoặc là creator)
// Column name phải chính xác(case -sensitive)
// Chỉ các trường được truyền và khác với giá trị hiện tại mới được cập nhật

// {
//   "data": {
//     "sheetId": 101,
//       "version": 1,
//         "columns": [
//           "name": "Email",
//           "index": 2,
//           "color": "#FF0000",
//           "required": true,
//           "options": []
//         ]
//   }
// }

// sẽ gửi cả cục colums luôn
