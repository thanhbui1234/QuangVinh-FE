import { useMutation } from '@tanstack/react-query'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { handleCommonError } from '@/utils/handleErrors'
import { queryClient } from '@/lib/queryClient'
import { workBoardsKey } from '@/constants'

interface UseUpdateNameWBParams {
  sheetId: number
  name: string
}
export const useUpdateNameWB = () => {
  const updateNameWBMutation = useMutation({
    mutationFn: async ({ sheetId, name }: UseUpdateNameWBParams): Promise<any> => {
      try {
        const response = (await POST(API_ENDPOINT.UPDATE_NAME_WORKBOARD, { sheetId, name })) as any
        return response
      } catch (error) {
        handleCommonError(error)
      }
    },
    onSuccess: ({ sheetId }) => {
      queryClient.invalidateQueries({ queryKey: [workBoardsKey.detail(sheetId)] })
    },
  })

  return updateNameWBMutation
}
