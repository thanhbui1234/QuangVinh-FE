import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { useQuery } from '@tanstack/react-query'
import { projectAssignmentDetailKey } from '@/constants'
import { useEffect } from 'react'
import { handleCommonError } from '@/utils/handleErrors'
import { useNavigate } from 'react-router-dom'

export const useGetDetailProject = (id: number) => {
  const navigate = useNavigate()

  const { data, isFetching, error } = useQuery({
    queryKey: [projectAssignmentDetailKey.detail(id.toString()), { taskGroupId: id }],
    queryFn: () => POST(API_ENDPOINT.GET_PROJECT_DETAIL, { taskGroupId: Number(id) }),
    select: (data) => {
      return data.taskGroup
    },
  })

  useEffect(() => {
    if (error) {
      handleCommonError(error)
      navigate('/assignments')
    }
  }, [error, navigate])

  return { projectAssignmentDetail: data, isFetching, error }
}
