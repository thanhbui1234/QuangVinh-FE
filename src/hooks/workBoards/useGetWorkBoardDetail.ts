import { useQuery } from '@tanstack/react-query'
import { workBoardsKey } from '@/constants/assignments/assignment'
import { useEffect } from 'react'
import { handleCommonError } from '@/utils/handleErrors'
import { mockWorkBoardsService } from '@/services/workBoards/mockWorkBoardsService'

export const useGetWorkBoardDetail = (id: number) => {
  const { data, isFetching, error } = useQuery({
    queryKey: [workBoardsKey.detail(id)],
    queryFn: async () => {
      return await mockWorkBoardsService.getDetail(id)
    },
    enabled: !!id,
  })

  useEffect(() => {
    if (error) {
      handleCommonError(error)
    }
  }, [error])

  return {
    workBoard: data?.workBoard,
    isFetching,
    error,
  }
}
