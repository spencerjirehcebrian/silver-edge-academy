import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as coursesApi from '@/services/api/courses'

export function useExercise(exerciseId: string | undefined) {
  return useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: () => coursesApi.getExercise(exerciseId!),
    enabled: !!exerciseId,
  })
}

export function useSubmitExercise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ exerciseId, code }: { exerciseId: string; code: string }) =>
      coursesApi.submitExercise(exerciseId, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['lesson'] })
    },
  })
}
