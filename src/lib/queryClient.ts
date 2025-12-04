// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'
import { handleCommonError } from '@/utils/handleErrors'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
    mutations: {
      onError: (error: unknown) => {
        handleCommonError(error)
      },
    },
  },
})
