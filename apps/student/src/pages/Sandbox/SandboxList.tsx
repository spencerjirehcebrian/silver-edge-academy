import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Code, Trash2, Clock } from 'lucide-react'
import { useSandboxProjects, useCreateSandboxProject, useDeleteSandboxProject } from '@/hooks/queries/useSandbox'
import { useToast } from '@/contexts/ToastContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDistanceToNow } from 'date-fns'
import type { SandboxProject } from '@/types/student'

export default function SandboxList() {
  const { data, isLoading, error } = useSandboxProjects()
  const createMutation = useCreateSandboxProject()
  const deleteMutation = useDeleteSandboxProject()
  const { addToast } = useToast()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectLanguage, setNewProjectLanguage] = useState<'javascript' | 'python'>('javascript')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!newProjectName.trim()) {
      addToast({ type: 'error', message: 'Please enter a project name' })
      return
    }

    try {
      await createMutation.mutateAsync({
        name: newProjectName.trim(),
        language: newProjectLanguage,
      })
      setShowCreateModal(false)
      setNewProjectName('')
      addToast({ type: 'success', message: 'Project created!' })
    } catch {
      addToast({ type: 'error', message: 'Failed to create project' })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await deleteMutation.mutateAsync(deleteId)
      setDeleteId(null)
      addToast({ type: 'success', message: 'Project deleted' })
    } catch {
      addToast({ type: 'error', message: 'Failed to delete project' })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          <Skeleton variant="rectangular" className="h-32" />
          <Skeleton variant="rectangular" className="h-32" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load projects</p>
      </div>
    )
  }

  const canCreateMore = (data?.count || 0) < (data?.maxProjects || 50)

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Sandbox</h1>
          <p className="text-sm text-slate-500">
            {data?.count || 0} / {data?.maxProjects || 50} projects
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          disabled={!canCreateMore}
        >
          <Plus className="w-4 h-4 mr-1" />
          New Project
        </Button>
      </div>

      {/* Projects list */}
      {!data?.projects.length ? (
        <EmptyState
          icon={<Code className="w-8 h-8" />}
          title="No projects yet"
          description="Create your first sandbox project to start experimenting with code!"
          action={
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Create Project
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {data.projects.map((project: SandboxProject) => (
            <Card key={project.id} interactive padding="md">
              <Link to={`/sandbox/${project.id}`} className="block">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 truncate">{project.name}</h3>
                      <Badge variant={project.language === 'javascript' ? 'warning' : 'primary'} size="sm">
                        {project.language === 'javascript' ? 'JS' : 'PY'}
                      </Badge>
                    </div>
                    {project.description && (
                      <p className="text-sm text-slate-500 truncate">{project.description}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>
                        Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setDeleteId(project.id)
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New Project"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Project Name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="My Awesome Project"
            autoFocus
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Language
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setNewProjectLanguage('javascript')}
                className={`flex-1 p-3 rounded-xl border-2 transition-colors ${
                  newProjectLanguage === 'javascript'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200'
                }`}
              >
                <span className="font-medium">JavaScript</span>
              </button>
              <button
                onClick={() => setNewProjectLanguage('python')}
                className={`flex-1 p-3 rounded-xl border-2 transition-colors ${
                  newProjectLanguage === 'python'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200'
                }`}
              >
                <span className="font-medium">Python</span>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreate} isLoading={createMutation.isPending} className="flex-1">
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Project"
        size="sm"
      >
        <p className="text-slate-600 mb-4">
          Are you sure you want to delete this project? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteId(null)} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={deleteMutation.isPending} className="flex-1">
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
