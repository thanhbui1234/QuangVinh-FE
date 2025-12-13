import { useQuery } from '@tanstack/react-query'
import { workBoardsKey } from '@/constants/assignments/assignment'
import { useEffect } from 'react'
import { handleCommonError } from '@/utils/handleErrors'
import { mockWorkBoardsService } from '@/services/workBoards/mockWorkBoardsService'

export const useGetWorkBoards = () => {
  const { data, isFetching, error } = useQuery({
    queryKey: [workBoardsKey.getAll],
    queryFn: async () => {
      return await mockWorkBoardsService.getList()
    },
  })

  useEffect(() => {
    if (error) {
      handleCommonError(error)
    }
  }, [error])

  return {
    workBoards: data?.workBoards || [],
    total: data?.total || 0,
    isFetching,
    error,
  }
}
