import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as coursesApi from '@/services/api/courses'

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getCourses(),
  })
}

export function useCourseMap(courseId: string | undefined) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getCourseMap(courseId!),
    enabled: !!courseId,
  })
}

export function useLesson(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => coursesApi.getLesson(lessonId!),
    enabled: !!lessonId,
  })
}

export function useCompleteLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lessonId: string) => coursesApi.completeLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['course'] })
    },
  })
}
