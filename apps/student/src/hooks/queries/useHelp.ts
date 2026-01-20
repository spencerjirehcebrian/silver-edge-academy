import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as helpApi from '@/services/api/help'

export function useHelpRequests() {
  return useQuery({
    queryKey: ['help-requests'],
    queryFn: () => helpApi.getHelpRequests(),
  })
}

export function useHelpRequest(requestId: string | undefined) {
  return useQuery({
    queryKey: ['help-request', requestId],
    queryFn: () => helpApi.getHelpRequest(requestId!),
    enabled: !!requestId,
  })
}

export function useCreateHelpRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      lessonId: string
      lessonTitle: string
      exerciseId?: string
      exerciseTitle?: string
      message: string
      codeSnapshot?: string
    }) => helpApi.createHelpRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-requests'] })
    },
  })
}
