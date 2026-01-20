import { Link } from 'react-router-dom'
import { Play, HelpCircle, MoreHorizontal, Copy, Trash2, Pencil } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DragHandle } from '@/components/ui/DragDrop'
import { DropdownMenu, type DropdownMenuItem } from '@/components/ui/DropdownMenu'
import { useConfirmDialog, ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useDeleteLesson, useDuplicateLesson } from '@/hooks/queries/useCourses'
import type { CourseLesson } from '@/services/api/courses'

interface LessonItemProps {
  courseId: string
  sectionId: string
  lesson: CourseLesson
}

export function LessonItem({ courseId, sectionId, lesson }: LessonItemProps) {
  const { confirm, dialogProps } = useConfirmDialog()
  const deleteLesson = useDeleteLesson()
  const duplicateLesson = useDuplicateLesson()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Lesson',
      message: `Are you sure you want to delete "${lesson.title}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    })

    if (confirmed) {
      await deleteLesson.mutateAsync({
        courseId,
        sectionId,
        lessonId: lesson.id,
      })
    }
  }

  const handleDuplicate = async () => {
    await duplicateLesson.mutateAsync({
      courseId,
      sectionId,
      lessonId: lesson.id,
    })
  }

  const menuItems: DropdownMenuItem[] = [
    {
      label: 'Duplicate',
      icon: <Copy className="w-4 h-4" />,
      onClick: handleDuplicate,
    },
    {
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDelete,
      variant: 'danger',
    },
  ]

  const LessonIcon = lesson.type === 'quiz' ? HelpCircle : Play

  return (
    <>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-2 p-3 rounded-lg bg-white border border-slate-100 hover:border-slate-200 transition-colors ${
          isDragging ? 'opacity-50 shadow-lg' : ''
        }`}
      >
        <DragHandle {...attributes} {...listeners} />

        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <LessonIcon className="w-4 h-4 text-slate-500" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-700 text-sm truncate">{lesson.title}</p>
          <p className="text-xs text-slate-400">
            {lesson.duration ? `${lesson.duration} min` : 'Duration not set'}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            lesson.status === 'published'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              lesson.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          />
          {lesson.status === 'published' ? 'Published' : 'Draft'}
        </span>

        <Link
          to={`/admin/courses/${courseId}/sections/${sectionId}/lessons/${lesson.id}`}
          className="p-1.5 text-slate-400 hover:text-accent-600 hover:bg-accent-50 rounded transition-colors"
          title="Edit lesson"
        >
          <Pencil className="w-4 h-4" />
        </Link>

        <DropdownMenu
          trigger={
            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          }
          items={menuItems}
        />
      </div>
    </>
  )
}
