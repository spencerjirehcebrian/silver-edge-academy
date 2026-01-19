import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, Code, FileQuestion, CheckCircle } from 'lucide-react'
import { useLesson, useCompleteLesson } from '@/hooks/queries/useCourses'
import { useGamification } from '@/contexts/GamificationContext'
import { useToast } from '@/contexts/ToastContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import type { LessonStep } from '@/types/student'

export default function LessonView() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const navigate = useNavigate()
  const { data: lesson, isLoading, error } = useLesson(lessonId)
  const completeLessonMutation = useCompleteLesson()
  const { triggerXpGain } = useGamification()
  const { addToast } = useToast()

  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton variant="rectangular" className="h-96 w-full" />
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load lesson</p>
        <Link to={`/courses/${courseId}`} className="text-violet-600 hover:underline mt-2 inline-block">
          Back to course
        </Link>
      </div>
    )
  }

  const currentStep = lesson.steps[currentStepIndex]
  const isLastStep = currentStepIndex === lesson.steps.length - 1
  const allStepsCompleted = lesson.steps.every((s) => s.completed)

  const handleNextStep = () => {
    if (currentStepIndex < lesson.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleCompleteLesson = async () => {
    try {
      const result = await completeLessonMutation.mutateAsync(lesson.id)
      if (result.xpEarned > 0) {
        triggerXpGain(result.xpEarned, 'lesson')
      }
      addToast({ type: 'success', message: 'Lesson completed!' })
      navigate(`/courses/${courseId}`)
    } catch {
      addToast({ type: 'error', message: 'Failed to complete lesson' })
    }
  }

  return (
    <div className="max-w-[680px] mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Link
          to={`/courses/${courseId}`}
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to course</span>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <Badge variant="default" className="mb-2">{lesson.sectionTitle}</Badge>
            <h1 className="font-display text-2xl font-bold text-slate-800">{lesson.title}</h1>
          </div>
          <Badge variant="warning" className="text-lg px-3 py-1">
            +{lesson.xpReward} XP
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {lesson.steps.map((step: LessonStep, index: number) => {
          const Icon = step.type === 'content' ? BookOpen :
                       step.type === 'exercise' ? Code :
                       FileQuestion
          return (
            <button
              key={step.id}
              onClick={() => setCurrentStepIndex(index)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 whitespace-nowrap',
                index === currentStepIndex
                  ? 'bg-violet-100/80 text-violet-700 backdrop-blur-sm'
                  : step.completed
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              )}
            >
              {step.completed ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <Card padding="lg">
        {currentStep.type === 'content' && (
          <div className="prose prose-slate max-w-none">
            <div dangerouslySetInnerHTML={{ __html: formatMarkdown(lesson.content) }} />
          </div>
        )}

        {currentStep.type === 'exercise' && (
          <div className="text-center py-12">
            <Code className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Exercise: {currentStep.title}</h3>
            <p className="text-slate-500 mb-6">Complete the coding exercise to continue</p>
            <Link to={`/courses/${courseId}/lessons/${lessonId}/exercises/${currentStep.id}`}>
              <Button>Start Exercise</Button>
            </Link>
          </div>
        )}

        {currentStep.type === 'quiz' && (
          <div className="text-center py-12">
            <FileQuestion className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Quiz: {currentStep.title}</h3>
            <p className="text-slate-500 mb-6">Test your knowledge with a quick quiz</p>
            <Link to={`/courses/${courseId}/lessons/${lessonId}/quizzes/${currentStep.id}`}>
              <Button>Start Quiz</Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handlePrevStep}
          disabled={currentStepIndex === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        {isLastStep && allStepsCompleted ? (
          <Button onClick={handleCompleteLesson} isLoading={completeLessonMutation.isPending}>
            Complete Lesson
            <CheckCircle className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleNextStep} disabled={isLastStep}>
            Next
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}

// Simple markdown formatter for lesson content
function formatMarkdown(content: string): string {
  return content
    .replace(/^### (.*$)/gm, '<h3 class="font-display text-lg font-bold mt-6 mb-2 text-slate-800">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="font-display text-xl font-bold mt-6 mb-3 text-slate-800">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="font-display text-2xl font-bold mt-6 mb-4 text-slate-800">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-violet-50 px-1.5 py-0.5 rounded text-sm font-mono text-violet-600">$1</code>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 p-4 rounded-2xl overflow-x-auto my-4 border-2 border-violet-500/20"><code class="font-mono text-sm">$2</code></pre>')
    .replace(/^- (.*$)/gm, '<li class="ml-4 text-slate-600">$1</li>')
    .replace(/\n\n/g, '</p><p class="my-3 text-slate-600 leading-relaxed">')
    .replace(/^(?!<)(.+)$/gm, '<p class="my-3 text-slate-600 leading-relaxed">$1</p>')
}
