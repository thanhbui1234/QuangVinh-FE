import { POST, GET, DELETE } from '@/core/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { API_ENDPOINT } from '@/common'
import type {
  UploadDocumentPayload,
  UploadDocumentResponse,
  GetDocumentsResponse,
} from '@/types/Document'
import { toast } from 'sonner'

// Query keys
export const documentKeys = {
  all: ['documents'] as const,
  my: () => [...documentKeys.all, 'my'] as const,
  shared: () => [...documentKeys.all, 'shared'] as const,
}

// Upload document hook
export const useUploadDocument = () => {
  const queryClient = useQueryClient()

  return useMutation<UploadDocumentResponse, Error, UploadDocumentPayload>({
    mutationFn: async (payload: UploadDocumentPayload) => {
      const response = await POST(API_ENDPOINT.UPLOAD_DOCUMENT, {
        data: payload,
      })
      return response as UploadDocumentResponse
    },
    onSuccess: () => {
      // Invalidate my documents list
      queryClient.invalidateQueries({ queryKey: documentKeys.my() })
      toast.success('Tải lên tài liệu thành công')
    },
    onError: (error) => {
      console.error('Upload document failed:', error)
      toast.error('Tải lên tài liệu thất bại')
    },
  })
}

// Get my documents h

// Get shared documents hook
export const useGetSharedDocuments = () => {
  return useQuery<GetDocumentsResponse, Error>({
    queryKey: documentKeys.shared(),
    queryFn: async () => {
      const response = await GET(API_ENDPOINT.GET_SHARED_DOCUMENTS)
      return response as GetDocumentsResponse
    },
  })
}

// Delete document hook
export const useDeleteDocument = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, number>({
    mutationFn: async (documentId: number) => {
      await DELETE(`${API_ENDPOINT.DELETE_DOCUMENT}/${documentId}`)
    },
    onSuccess: () => {
      // Invalidate both my and shared documents
      queryClient.invalidateQueries({ queryKey: documentKeys.my() })
      queryClient.invalidateQueries({ queryKey: documentKeys.shared() })
      toast.success('Xóa tài liệu thành công')
    },
    onError: (error) => {
      console.error('Delete document failed:', error)
      toast.error('Xóa tài liệu thất bại')
    },
  })
}
