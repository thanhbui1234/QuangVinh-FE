import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'

import { API_ENDPOINT } from '@/common'
import { normalizeImage } from '@/utils/normalizeImage'

interface UploadFileResponse {
  viewUrl: string
  downloadUrl: string
}

export const useUploadFile = () => {
  return useMutation<UploadFileResponse, Error, File>({
    mutationFn: async (file: File) => {
      const normalizedFile = await normalizeImage(file)

      const formData = new FormData()
      formData.append('file', normalizedFile)

      return (await POST(API_ENDPOINT.UPLOAD_FILE, formData)) as UploadFileResponse
    },

    onError: (error) => {
      console.error('Upload failed:', error)
    },
  })
}
