import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FileCode, X } from 'lucide-react'
import { FormSection } from '@/components/forms/FormSection'
import { FormField, FormRow } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { useCreateClass } from '@/hooks/queries/useClasses'
import { useToast } from '@/contexts/ToastContext'

const COLOR_OPTIONS = [
  { value: '#6366f1', label: 'Indigo', bg: 'bg-accent-500' },
  { value: '#10b981', label: 'Emerald', bg: 'bg-emerald-500' },
  { value: '#f59e0b', label: 'Amber', bg: 'bg-amber-500' },
  { value: '#ec4899', label: 'Pink', bg: 'bg-pink-500' },
  { value: '#8b5cf6', label: 'Violet', bg: 'bg-violet-500' },
  { value: '#0ea5e9', label: 'Sky', bg: 'bg-sky-500' },
]

export default function ClassCreate() {
  const navigate = useNavigate()
  const createClass = useCreateClass()
  const { addToast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    startDate: '',
    endDate: '',
    teacherId: '',
    courseIds: [] as string[],
    status: 'active' as 'active' | 'draft',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: teachersData } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const res = await fetch('/api/teachers')
      return res.json()
    },
  })

  const { data: coursesData } = useQuery({
    queryKey: ['courses', 'available'],
    queryFn: async () => {
      const res = await fetch('/api/courses/available')
      return res.json()
    },
  })

  const teachers = teachersData?.data || []
  const courses = coursesData?.data || []

  const handleChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const toggleCourse = (courseId: string) => {
    setFormData((prev) => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter((id) => id !== courseId)
        : [...prev.courseIds, courseId],
    }))
  }

  const removeCourse = (courseId: string) => {
    setFormData((prev) => ({
      ...prev,
      courseIds: prev.courseIds.filter((id) => id !== courseId),
    }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required'
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      await createClass.mutateAsync(formData)
      addToast({ type: 'success', message: `Class "${formData.name}" has been created.` })
      navigate('/admin/classes')
    } catch {
      addToast({ type: 'error', message: 'Failed to create class. Please try again.' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Class Details */}
      <FormSection title="Class Details">
        <FormField label="Class Name" required error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Grade 5 Section A"
            error={!!errors.name}
          />
        </FormField>

        <FormField label="Description">
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Optional description for this class..."
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none"
          />
        </FormField>

        <FormField label="Class Color" hint="Used to identify this class visually.">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: formData.color }}
            >
              <span className="text-white font-bold text-sm">
                {formData.name ? formData.name.replace('Class ', '').slice(0, 3) : '5A'}
              </span>
            </div>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleChange('color', color.value)}
                  className={`w-8 h-8 rounded-lg ${color.bg} transition-all ${
                    formData.color === color.value
                      ? 'ring-2 ring-offset-2 ring-slate-400'
                      : 'hover:ring-2 hover:ring-offset-2 hover:ring-slate-200'
                  }`}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        </FormField>
      </FormSection>

      {/* Schedule */}
      <FormSection title="Schedule" description="Set the class schedule dates (optional).">
        <FormRow>
          <FormField label="Start Date">
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
            />
          </FormField>
          <FormField label="End Date" error={errors.endDate}>
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              error={!!errors.endDate}
            />
          </FormField>
        </FormRow>
      </FormSection>

      {/* Teacher Assignment */}
      <FormSection
        title="Teacher Assignment"
        description="Assign a teacher to this class."
      >
        <FormField label="Assign Teacher" hint="You can assign a teacher later.">
          <Select
            value={formData.teacherId}
            onChange={(e) => handleChange('teacherId', e.target.value)}
          >
            <option value="">No teacher assigned</option>
            {teachers.map((teacher: { id: string; name: string }) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </Select>
        </FormField>
      </FormSection>

      {/* Course Assignment */}
      <FormSection
        title="Course Assignment"
        description="Select courses to assign to this class."
      >
        <FormField label="Assign Courses">
          {/* Selected courses as badges */}
          {formData.courseIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.courseIds.map((courseId) => {
                const course = courses.find((c: { id: string }) => c.id === courseId)
                if (!course) return null
                return (
                  <span
                    key={courseId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent-50 text-accent-700 rounded-lg text-sm"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    {course.name}
                    <button
                      type="button"
                      onClick={() => removeCourse(courseId)}
                      className="hover:bg-accent-100 rounded p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )
              })}
            </div>
          )}
          {/* Course checkbox list */}
          <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
            {courses.length === 0 ? (
              <p className="p-4 text-sm text-slate-500 text-center">No courses available</p>
            ) : (
              courses.map((course: { id: string; name: string; category?: string }) => (
                <label
                  key={course.id}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                >
                  <Checkbox
                    checked={formData.courseIds.includes(course.id)}
                    onChange={() => toggleCourse(course.id)}
                  />
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        course.category === 'JavaScript'
                          ? 'bg-amber-100'
                          : course.category === 'Python'
                            ? 'bg-sky-100'
                            : 'bg-slate-100'
                      }`}
                    >
                      <FileCode
                        className={`w-4 h-4 ${
                          course.category === 'JavaScript'
                            ? 'text-amber-600'
                            : course.category === 'Python'
                              ? 'text-sky-600'
                              : 'text-slate-600'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{course.name}</p>
                      {course.category && (
                        <p className="text-xs text-slate-500">{course.category}</p>
                      )}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
        </FormField>
      </FormSection>

      {/* Status */}
      <FormSection
        title="Class Status"
        description="Draft classes are not visible to students."
      >
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="active"
              checked={formData.status === 'active'}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-4 h-4 text-accent-600 focus:ring-accent-500"
            />
            <span className="text-sm text-slate-700">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="draft"
              checked={formData.status === 'draft'}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-4 h-4 text-accent-600 focus:ring-accent-500"
            />
            <span className="text-sm text-slate-700">Draft</span>
          </label>
        </div>
      </FormSection>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Link
          to="/admin/classes"
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
        >
          Cancel
        </Link>
        <Button type="submit" isLoading={createClass.isPending}>
          Create Class
        </Button>
      </div>
    </form>
  )
}
