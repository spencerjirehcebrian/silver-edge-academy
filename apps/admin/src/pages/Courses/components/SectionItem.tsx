import { useState } from 'react'
import { Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DragHandle } from '@/components/ui/DragDrop'
import { Tooltip } from '@/components/ui/Tooltip'
import { useConfirmDialog, ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useDeleteSection } from '@/hooks/queries/useCourses'
import type { CourseSection } from '@/services/api/courses'
import { SectionForm } from './SectionForm'
import { LessonList } from './LessonList'

interface SectionItemProps {
  courseId: string
  section: CourseSection
  index: number
}

export function SectionItem({ courseId, section, index }: SectionItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const { confirm, dialogProps } = useConfirmDialog()
  const deleteSection = useDeleteSection()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const hasLessons = (section.lessons?.length || 0) > 0

  const handleDelete = async () => {
    if (hasLessons) return

    const confirmed = await confirm({
      title: 'Delete Section',
      message: `Are you sure you want to delete "${section.title}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    })

    if (confirmed) {
      await deleteSection.mutateAsync({ courseId, sectionId: section.id })
    }
  }

  if (isEditing) {
    return (
      <SectionForm
        courseId={courseId}
        section={section}
        onCancel={() => setIsEditing(false)}
        onSuccess={() => setIsEditing(false)}
      />
    )
  }

  return (
    <>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
      <div
        ref={setNodeRef}
        style={style}
        className={`border border-slate-200 rounded-lg overflow-hidden ${
          isDragging ? 'opacity-50 shadow-lg' : ''
        }`}
      >
        {/* Section Header */}
        <div className="flex items-center gap-2 p-4 bg-slate-50">
          <DragHandle {...attributes} {...listeners} />

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">Section {index + 1}</span>
              <span className="font-semibold text-slate-800 truncate">{section.title}</span>
            </div>
            {section.description && (
              <p className="text-sm text-slate-500 truncate mt-0.5">{section.description}</p>
            )}
          </div>

          <span className="text-sm text-slate-500 whitespace-nowrap">
            {section.lessons?.length || 0} lessons
          </span>

          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-slate-400 hover:text-accent-600 hover:bg-accent-50 rounded transition-colors"
            title="Edit section"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {hasLessons ? (
            <Tooltip content="Remove all lessons from this section first">
              <button
                disabled
                className="p-1.5 text-slate-200 cursor-not-allowed rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete section"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Section Content (Lessons) */}
        {isExpanded && (
          <div className="p-4 border-t border-slate-200">
            <LessonList
              courseId={courseId}
              sectionId={section.id}
              lessons={section.lessons || []}
            />
          </div>
        )}
      </div>
    </>
  )
}
