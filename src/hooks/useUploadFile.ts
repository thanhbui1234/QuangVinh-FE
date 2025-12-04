import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'

import { API_ENDPOINT } from '@/common'

interface UploadFileResponse {
  requestId: string
  actionUserId: number
  actionUser: string
  requestPath: string
  data: {
    viewUrl: string
    downloadUrl: string
  }
}

export const useUploadFile = () => {
  const uploadFileMutation = useMutation<UploadFileResponse, Error, File>({
    mutationFn: async (payload: File) => {
      const formData = new FormData()
      formData.append('file', payload)

      const response = (await POST(API_ENDPOINT.UPLOAD_FILE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })) as UploadFileResponse

      return response
    },
    onError: (error) => {
      console.error('Upload failed:', error)
    },
  })

  return uploadFileMutation
}
