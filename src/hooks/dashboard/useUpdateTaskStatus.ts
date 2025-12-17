import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { dashboardMyTasksKey } from '@/constants/dashboard/dashboard'

interface UpdateTaskStatusPayload {
  taskId: number
  newStatus: number
}

export const useUpdateTaskStatus = () => {
  const mutation = useMutation({
    mutationFn: async ({ taskId, newStatus }: UpdateTaskStatusPayload) => {
      const response = await POST(API_ENDPOINT.UPDATE_STATUS, { taskId, newStatus })
      return response
    },
    onSuccess: (response) => {
      // Invalidate all dashboard my tasks queries to refetch the data
      queryClient.invalidateQueries({
        queryKey: dashboardMyTasksKey.all,
      })

      SonnerToaster({
        type: 'success',
        message: 'Cập nhật trạng thái thành công',
        description: response.message || 'Đã cập nhật trạng thái công việc',
      })
    },
    onError: (error: any) => {
      SonnerToaster({
        type: 'error',
        message: 'Cập nhật trạng thái thất bại',
        description: error.message || 'Đã có lỗi xảy ra khi cập nhật trạng thái',
      })
    },
  })

  return mutation
}
