import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { workBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'
import SonnerToaster from '@/components/ui/toaster'
import { handleCommonError } from '@/utils/handleErrors'

interface ImportExcelRequest {
  sheetId: number
  actionUserId: number
  file: File
}

export const useImportExcelSheetRow = () => {
  const importExcelMutation = useMutation({
    mutationFn: async (payload: ImportExcelRequest): Promise<any> => {
      try {
        const formData = new FormData()
        formData.append('file', payload.file)
        formData.append('sheetId', payload.sheetId.toString())
        formData.append('actionUserId', payload.actionUserId.toString())

        const response = await POST(API_ENDPOINT.IMPORT_EXCEL_SHEET_ROW, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        return response
      } catch (error) {
        handleCommonError(error)
        throw error
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate work board detail to trigger refetch
      // This will match all queries with this prefix, including those with rowSize parameter
      queryClient.invalidateQueries({
        queryKey: workBoardsKey.detail(variables.sheetId),
        refetchType: 'active', // Only refetch active queries
      })
      SonnerToaster({
        type: 'success',
        message: 'Import Excel thành công',
        description: 'Dữ liệu đã được cập nhật',
      })
    },
    onError: (error) => {
      SonnerToaster({
        type: 'error',
        message: 'Lỗi khi import Excel',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi import Excel',
      })
    },
  })

  return { importExcelMutation }
}
