import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import {
  Save,
  Eye,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Code,
  Image,
  Link as LinkIcon,
  Plus,
  ChevronDown,
  Trash2,
  X,
} from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Modal } from '@/components/ui/Modal'
import { useConfirmDialog, ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useLesson, useUpdateLesson } from '@/hooks/queries/useCourses'
import type { LessonExercise, LessonQuizQuestion } from '@/services/api/courses'
import { formatDate } from '@/utils/formatters'

export default function LessonEdit() {
  const { courseId, sectionId, lessonId } = useParams<{
    courseId: string
    sectionId: string
    lessonId: string
  }>()

  const { data: lesson, isLoading } = useLesson(courseId || '', sectionId || '', lessonId || '')
  const updateLesson = useUpdateLesson()

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    duration: 15,
    xpReward: 10,
    editorMode: 'text' as 'visual' | 'text' | 'mixed',
    status: 'draft' as 'draft' | 'published',
  })

  const [exercises, setExercises] = useState<LessonExercise[]>([])
  const [quiz, setQuiz] = useState<LessonQuizQuestion[]>([])
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [originalData, setOriginalData] = useState<{
    formData: typeof formData
    exercises: LessonExercise[]
    quiz: LessonQuizQuestion[]
  } | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { confirm, dialogProps } = useConfirmDialog()

  // Helper to insert markdown syntax at cursor position
  const insertMarkdown = useCallback((prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    setFormData((prev) => {
      const text = prev.content
      const selectedText = text.substring(start, end)
      const newText =
        text.substring(0, start) +
        prefix +
        selectedText +
        suffix +
        text.substring(end)
      return { ...prev, content: newText }
    })

    // Restore cursor position after state update using requestAnimationFrame
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length)
    })
  }, [])

  // Load lesson data
  useEffect(() => {
    if (lesson) {
      const newFormData = {
        title: lesson.title,
        content: lesson.content,
        duration: lesson.duration,
        xpReward: lesson.xpReward,
        editorMode: lesson.editorMode,
        status: lesson.status,
      }
      const newExercises = lesson.exercises || []
      const newQuiz = lesson.quiz || []

      setFormData(newFormData)
      setExercises(newExercises)
      setQuiz(newQuiz)
      setOriginalData({
        formData: newFormData,
        exercises: newExercises,
        quiz: newQuiz,
      })
      if (lesson.exercises?.length) {
        setExpandedExercise(lesson.exercises[0].id)
      }
    }
  }, [lesson])

  // Track changes by comparing to original data
  const isDirty = useMemo(() => {
    if (!originalData) return false
    return (
      JSON.stringify(formData) !== JSON.stringify(originalData.formData) ||
      JSON.stringify(exercises) !== JSON.stringify(originalData.exercises) ||
      JSON.stringify(quiz) !== JSON.stringify(originalData.quiz)
    )
  }, [formData, exercises, quiz, originalData])

  // Auto-save every 30 seconds when dirty
  useEffect(() => {
    if (!isDirty || !courseId || !sectionId || !lessonId) return

    const timer = setTimeout(async () => {
      try {
        await updateLesson.mutateAsync({
          courseId,
          sectionId,
          lessonId,
          ...formData,
          exercises,
          quiz,
        })
        setLastSaved(new Date())
        setOriginalData({ formData, exercises, quiz })
      } catch {
        // Silent fail for auto-save, user can manually save
        console.error('Auto-save failed')
      }
    }, 30000) // 30 seconds

    return () => clearTimeout(timer)
  }, [isDirty, formData, exercises, quiz, courseId, sectionId, lessonId, updateLesson])

  const handleSave = async () => {
    if (!courseId || !sectionId || !lessonId) return

    await updateLesson.mutateAsync({
      courseId,
      sectionId,
      lessonId,
      ...formData,
      exercises,
      quiz,
    })
    setLastSaved(new Date())
    setOriginalData({ formData, exercises, quiz })
  }

  const addExercise = () => {
    const newExercise: LessonExercise = {
      id: `ex${Date.now()}`,
      title: `Exercise ${exercises.length + 1}`,
      instructions: '',
      starterCode: '// Write your code below\n',
      solution: '',
    }
    setExercises([...exercises, newExercise])
    setExpandedExercise(newExercise.id)
  }

  const updateExercise = (id: string, updates: Partial<LessonExercise>) => {
    setExercises(exercises.map((ex) => (ex.id === id ? { ...ex, ...updates } : ex)))
  }

  const deleteExercise = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id))
    if (expandedExercise === id) {
      setExpandedExercise(null)
    }
  }

  const getDefaultOptions = (type: LessonQuizQuestion['type']) => {
    switch (type) {
      case 'true-false':
        return ['True', 'False']
      default:
        return ['', '', '', '']
    }
  }

  const addQuizQuestion = (type: LessonQuizQuestion['type'] = 'multiple-choice') => {
    const newQuestion: LessonQuizQuestion = {
      id: `q${Date.now()}`,
      type,
      question: '',
      options: getDefaultOptions(type),
      correctIndex: 0,
      codeSnippet: type === 'code-output' ? '' : undefined,
      explanation: '',
    }
    setQuiz([...quiz, newQuestion])
  }

  const handleTypeChange = (id: string, newType: LessonQuizQuestion['type']) => {
    setQuiz(
      quiz.map((q) =>
        q.id === id
          ? {
              ...q,
              type: newType,
              options: getDefaultOptions(newType),
              correctIndex: 0,
              codeSnippet: newType === 'code-output' ? '' : undefined,
            }
          : q
      )
    )
  }

  const updateQuizQuestion = (id: string, updates: Partial<LessonQuizQuestion>) => {
    setQuiz(quiz.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const hasQuestionContent = (q: LessonQuizQuestion) =>
    q.question.trim() !== '' ||
    q.options.some((opt) => opt.trim() !== '') ||
    (q.codeSnippet && q.codeSnippet.trim() !== '')

  const deleteQuizQuestion = async (id: string) => {
    const question = quiz.find((q) => q.id === id)
    if (!question) return

    if (hasQuestionContent(question)) {
      const confirmed = await confirm({
        title: 'Delete Question?',
        message: 'This question has content. Are you sure you want to delete it? This cannot be undone.',
        confirmLabel: 'Delete',
        variant: 'danger',
      })
      if (!confirmed) return
    }

    setQuiz(quiz.filter((q) => q.id !== id))
  }

  const addOption = (questionId: string) => {
    setQuiz(quiz.map((q) => (q.id === questionId ? { ...q, options: [...q.options, ''] } : q)))
  }

  const removeOption = (questionId: string, optIndex: number) => {
    setQuiz(
      quiz.map((q) => {
        if (q.id !== questionId) return q
        const newOptions = q.options.filter((_, i) => i !== optIndex)
        return {
          ...q,
          options: newOptions,
          correctIndex: q.correctIndex >= newOptions.length ? 0 : q.correctIndex,
        }
      })
    )
  }

  if (isLoading) {
    return <LessonEditSkeleton />
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Lesson not found</p>
        <Link
          to={`/admin/courses/${courseId}`}
          className="text-accent-600 hover:underline mt-2 inline-block"
        >
          Back to Course
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-end gap-3">
        {/* Save status indicator */}
        <div className="text-sm text-slate-500">
          {lastSaved && (
            <span>Auto-saved {lastSaved.toLocaleTimeString()}</span>
          )}
          {isDirty && (
            <span className="text-amber-600 ml-2">Unsaved changes</span>
          )}
        </div>
        <Button variant="secondary" onClick={() => setShowPreview(true)}>
          <Eye className="w-4 h-4" />
          Preview
        </Button>
        <Button onClick={handleSave} isLoading={updateLesson.isPending}>
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden p-0">
            <Tabs defaultValue="content">
              <div className="border-b border-slate-200">
                <TabsList className="border-b-0">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="exercises">Exercises</TabsTrigger>
                  <TabsTrigger value="quiz">Quiz</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
              </div>

              {/* Content Tab */}
              <TabsContent value="content" className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Lesson Content
                    </label>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      {/* Toolbar */}
                      <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
                        <ToolbarButton icon={Bold} title="Bold" onClick={() => insertMarkdown('**', '**')} />
                        <ToolbarButton icon={Italic} title="Italic" onClick={() => insertMarkdown('*', '*')} />
                        <ToolbarButton icon={Underline} title="Underline" onClick={() => insertMarkdown('<u>', '</u>')} />
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <ToolbarButton icon={Heading1} title="Heading 1" onClick={() => insertMarkdown('# ')} />
                        <ToolbarButton icon={Heading2} title="Heading 2" onClick={() => insertMarkdown('## ')} />
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <ToolbarButton icon={List} title="Bullet List" onClick={() => insertMarkdown('- ')} />
                        <ToolbarButton icon={ListOrdered} title="Numbered List" onClick={() => insertMarkdown('1. ')} />
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <ToolbarButton icon={Code} title="Code Block" onClick={() => insertMarkdown('```\n', '\n```')} />
                        <ToolbarButton icon={Image} title="Image" onClick={() => insertMarkdown('![alt text](', ')')} />
                        <ToolbarButton icon={LinkIcon} title="Link" onClick={() => insertMarkdown('[', '](url)')} />
                      </div>
                      {/* Editor */}
                      <textarea
                        ref={textareaRef}
                        value={formData.content}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, content: e.target.value }))
                        }
                        className="w-full p-4 min-h-[400px] resize-none focus:outline-none font-mono text-sm"
                        placeholder="Write your lesson content here using Markdown..."
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Exercises Tab */}
              <TabsContent value="exercises" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-800">Code Exercises</h4>
                  <Button size="sm" onClick={addExercise}>
                    <Plus className="w-4 h-4" />
                    Add Exercise
                  </Button>
                </div>

                <div className="space-y-4">
                  {exercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className="border border-slate-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedExercise(
                            expandedExercise === exercise.id ? null : exercise.id
                          )
                        }
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Code className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-800">
                              Exercise {index + 1}: {exercise.title}
                            </h5>
                            <p className="text-sm text-slate-500">
                              {exercise.instructions.slice(0, 50) || 'No instructions yet'}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-slate-400 transition-transform ${
                            expandedExercise === exercise.id ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedExercise === exercise.id && (
                        <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                              Title
                            </label>
                            <Input
                              value={exercise.title}
                              onChange={(e) =>
                                updateExercise(exercise.id, { title: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                              Instructions
                            </label>
                            <textarea
                              value={exercise.instructions}
                              onChange={(e) =>
                                updateExercise(exercise.id, { instructions: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                              Starter Code
                            </label>
                            <textarea
                              value={exercise.starterCode}
                              onChange={(e) =>
                                updateExercise(exercise.id, { starterCode: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 font-mono text-sm resize-none"
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                              Solution
                            </label>
                            <textarea
                              value={exercise.solution}
                              onChange={(e) =>
                                updateExercise(exercise.id, { solution: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 font-mono text-sm resize-none"
                              rows={3}
                            />
                          </div>
                          <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                              onClick={() => deleteExercise(exercise.id)}
                              className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {exercises.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      No exercises yet. Click &quot;Add Exercise&quot; to create one.
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Quiz Tab */}
              <TabsContent value="quiz" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-slate-800">Lesson Quiz</h4>
                    <p className="text-sm text-slate-500">
                      Optional quiz to test understanding
                    </p>
                  </div>
                  <Button size="sm" onClick={() => addQuizQuestion()}>
                    <Plus className="w-4 h-4" />
                    Add Question
                  </Button>
                </div>

                <div className="space-y-4">
                  {quiz.map((question, index) => (
                    <div key={question.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-medium text-slate-500">
                          Question {index + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <select
                            value={question.type}
                            onChange={(e) =>
                              handleTypeChange(
                                question.id,
                                e.target.value as LessonQuizQuestion['type']
                              )
                            }
                            className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent-500"
                          >
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="true-false">True/False</option>
                            <option value="code-output">Code Output</option>
                          </select>
                          <button
                            onClick={() => deleteQuizQuestion(question.id)}
                            className="p-1 hover:bg-red-50 rounded text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Question
                          </label>
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) =>
                              updateQuizQuestion(question.id, { question: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm"
                          />
                        </div>
                        {/* Type-specific fields */}
                        {question.type === 'code-output' && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Code Snippet
                            </label>
                            <textarea
                              value={question.codeSnippet || ''}
                              onChange={(e) =>
                                updateQuizQuestion(question.id, { codeSnippet: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 font-mono text-sm resize-none"
                              rows={3}
                              placeholder="console.log(2 + '2');"
                            />
                          </div>
                        )}

                        {question.type === 'true-false' ? (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                              Correct Answer
                            </label>
                            <div className="flex items-center gap-4">
                              {question.options.map((option, optIndex) => (
                                <label key={optIndex} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`q${question.id}`}
                                    checked={question.correctIndex === optIndex}
                                    onChange={() =>
                                      updateQuizQuestion(question.id, { correctIndex: optIndex })
                                    }
                                    className="w-4 h-4 text-emerald-600"
                                  />
                                  <span className="text-sm text-slate-700">{option}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                              Options
                            </label>
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`q${question.id}`}
                                  checked={question.correctIndex === optIndex}
                                  onChange={() =>
                                    updateQuizQuestion(question.id, { correctIndex: optIndex })
                                  }
                                  className="w-4 h-4 text-emerald-600"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...question.options]
                                    newOptions[optIndex] = e.target.value
                                    updateQuizQuestion(question.id, { options: newOptions })
                                  }}
                                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm"
                                />
                                {question.correctIndex === optIndex && (
                                  <span className="text-xs text-emerald-600 font-medium">
                                    Correct
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeOption(question.id, optIndex)}
                                  disabled={question.options.length <= 2}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addOption(question.id)}
                              className="text-sm text-accent-600 hover:text-accent-700 font-medium flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              Add Option
                            </button>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Explanation (shown after answer)
                          </label>
                          <textarea
                            value={question.explanation || ''}
                            onChange={(e) =>
                              updateQuizQuestion(question.id, { explanation: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm resize-none"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {quiz.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      No quiz questions yet. Click &quot;Add Question&quot; to create one.
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Lesson Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, title: e.target.value }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Estimated Duration
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              duration: parseInt(e.target.value) || 0,
                            }))
                          }
                          min={1}
                        />
                        <span className="text-sm text-slate-500">minutes</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        XP Reward
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={formData.xpReward}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              xpReward: parseInt(e.target.value) || 0,
                            }))
                          }
                          min={0}
                        />
                        <span className="text-sm text-slate-500">XP</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Code Editor Mode
                    </label>
                    <div className="flex items-center gap-4">
                      {(['visual', 'text', 'mixed'] as const).map((mode) => (
                        <label key={mode} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="editorMode"
                            value={mode}
                            checked={formData.editorMode === mode}
                            onChange={() =>
                              setFormData((prev) => ({ ...prev, editorMode: mode }))
                            }
                            className="w-4 h-4 text-accent-600 focus:ring-accent-500"
                          />
                          <span className="text-sm text-slate-700 capitalize">
                            {mode === 'visual'
                              ? 'Visual (Block-based)'
                              : mode === 'text'
                                ? 'Text (Code)'
                                : 'Mixed'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Publication Status
                    </label>
                    <div className="flex items-center gap-4">
                      {(['draft', 'published'] as const).map((status) => (
                        <label key={status} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value={status}
                            checked={formData.status === status}
                            onChange={() => setFormData((prev) => ({ ...prev, status }))}
                            className="w-4 h-4 text-accent-600 focus:ring-accent-500"
                          />
                          <span className="text-sm text-slate-700 capitalize">{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lesson Info */}
          <Card>
            <CardHeader title="Lesson Info" />
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Course</span>
                <Link
                  to={`/admin/courses/${courseId}`}
                  className="text-accent-600 hover:underline"
                >
                  {lesson.courseTitle}
                </Link>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Section</span>
                <span className="text-slate-700">{lesson.sectionTitle}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Order</span>
                <span className="text-slate-700">Lesson {lesson.order}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Status</span>
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
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader title="Statistics" />
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xl font-bold text-slate-800">{lesson.completions}</p>
                <p className="text-xs text-slate-500">Completions</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xl font-bold text-emerald-600">{lesson.passRate}%</p>
                <p className="text-xs text-slate-500">Pass Rate</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xl font-bold text-slate-800">{lesson.avgTime}m</p>
                <p className="text-xs text-slate-500">Avg Time</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xl font-bold text-slate-800">{lesson.rating}</p>
                <p className="text-xs text-slate-500">Rating</p>
              </div>
            </div>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader title="Metadata" />
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Created</span>
                <span className="text-slate-700">{formatDate(lesson.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Last updated</span>
                <span className="text-slate-700">{formatDate(lesson.updatedAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Updated by</span>
                <span className="text-slate-700">{lesson.updatedByName}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Lesson Preview"
        size="xl"
      >
        <div className="prose prose-slate max-w-none max-h-[70vh] overflow-y-auto">
          {formData.content ? (
            <MarkdownPreview content={formData.content} />
          ) : (
            <p className="text-slate-500 italic">No content to preview</p>
          )}
        </div>
      </Modal>

      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </div>
  )
}

// Simple markdown preview component with XSS sanitization
function MarkdownPreview({ content }: { content: string }) {
  // Basic markdown to HTML conversion for preview
  // This is a simple implementation - react-markdown can be installed for better rendering
  const rawHtml = content
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1 rounded text-sm">$1</code>')
    // Lists
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^[0-9]+\. (.*$)/gm, '<li>$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />')

  // Sanitize HTML to prevent XSS attacks
  const sanitizedHtml = DOMPurify.sanitize(`<p>${rawHtml}</p>`, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'pre', 'code', 'li', 'ul', 'ol', 'br'],
    ALLOWED_ATTR: ['class'],
  })

  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      className="prose-headings:text-slate-800 prose-p:text-slate-600 prose-code:text-accent-700 prose-pre:bg-slate-900 prose-pre:text-slate-100"
    />
  )
}

interface ToolbarButtonProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  onClick: () => void
}

function ToolbarButton({ icon: Icon, title, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="p-2 hover:bg-slate-200 rounded transition-colors"
    >
      <Icon className="w-4 h-4 text-slate-600" />
    </button>
  )
}

function LessonEditSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="h-8 bg-slate-200 rounded w-48 mb-4 animate-pulse" />
          <div className="h-[400px] bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="h-6 bg-slate-200 rounded w-32 mb-4 animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-slate-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
