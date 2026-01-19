import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as sandboxApi from '@/services/api/sandbox'
import type { SandboxProject } from '@/types/student'

export function useSandboxProjects() {
  return useQuery({
    queryKey: ['sandbox-projects'],
    queryFn: () => sandboxApi.getSandboxProjects(),
  })
}

export function useSandboxProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ['sandbox-project', projectId],
    queryFn: () => sandboxApi.getSandboxProject(projectId!).then((res) => res.project),
    enabled: !!projectId,
  })
}

export function useCreateSandboxProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; language: 'javascript' | 'python'; description?: string }) =>
      sandboxApi.createSandboxProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sandbox-projects'] })
    },
  })
}

export function useUpdateSandboxProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Partial<SandboxProject> }) =>
      sandboxApi.updateSandboxProject(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['sandbox-projects'] })
      queryClient.invalidateQueries({ queryKey: ['sandbox-project', projectId] })
    },
  })
}

export function useDeleteSandboxProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: string) => sandboxApi.deleteSandboxProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sandbox-projects'] })
    },
  })
}
