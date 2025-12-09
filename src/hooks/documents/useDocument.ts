import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import { API_ENDPOINT } from '@/common'
import type { UploadDocumentPayload, UploadDocumentResponse } from '@/types/Document'
import { toast } from 'sonner'

// Upload document hook
export const useUploadDocument = () => {
  return useMutation<UploadDocumentResponse, Error, UploadDocumentPayload>({
    mutationFn: async (payload: UploadDocumentPayload) => {
      const response = await POST(API_ENDPOINT.UPLOAD_DOCUMENT, {
        ...payload,
      })
      return response as UploadDocumentResponse
    },
    onError: () => {
      toast.error('Tải lên tài liệu thất bại')
    },
  })
}
