import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, HelpCircle, Star, ChevronRight } from 'lucide-react'
import { useQuiz, useSubmitQuiz } from '@/hooks/queries/useQuizzes'
import { useGamification } from '@/contexts/GamificationContext'
import { useToast } from '@/contexts/ToastContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import type { QuizSubmitResult } from '@/types/student'

export default function QuizView() {
  const { courseId, lessonId, quizId } = useParams<{
    courseId: string
    lessonId: string
    quizId: string
  }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuiz(quizId)
  const submitMutation = useSubmitQuiz()
  const { triggerXpGain } = useGamification()
  const { addToast } = useToast()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, number>>(new Map())
  const [result, setResult] = useState<QuizSubmitResult | null>(null)
  const [showStart, setShowStart] = useState(true)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton variant="rectangular" className="h-64 w-full" />
      </div>
    )
  }

  if (error || !data || !data.questions) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load quiz</p>
        <Link
          to={`/app/courses/${courseId}/lessons/${lessonId}`}
          className="text-primary-600 hover:underline mt-2 inline-block"
        >
          Back to lesson
        </Link>
      </div>
    )
  }

  const quiz = data
  const questions = data.questions
  const currentQuestion = questions[currentQuestionIndex]
  const selectedAnswer = answers.get(currentQuestion?.id)
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  const handleSelectAnswer = (index: number) => {
    if (result) return
    setAnswers(new Map(answers.set(currentQuestion.id, index)))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    const answerArray = questions.map((q) => ({
      questionId: q.id,
      selectedIndex: answers.get(q.id) ?? -1,
    }))

    try {
      const submitResult = await submitMutation.mutateAsync({
        quizId: quiz.id,
        answers: answerArray,
      })
      setResult(submitResult)

      if (submitResult.passed && submitResult.xpEarned > 0) {
        triggerXpGain(submitResult.xpEarned, 'quiz')
      }

      if (submitResult.passed) {
        addToast({ type: 'success', message: 'Quiz passed! Great job!' })
      } else {
        addToast({ type: 'warning', message: `You got ${submitResult.score}/${submitResult.total} correct. Keep practicing!` })
      }
    } catch {
      addToast({ type: 'error', message: 'Failed to submit quiz' })
    }
  }

  // Start screen
  if (showStart) {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <Link
          to={`/app/courses/${courseId}/lessons/${lessonId}`}
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to lesson</span>
        </Link>

        <Card padding="lg" className="text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-10 h-10 text-primary-600" />
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-2">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-slate-500 mb-4">{quiz.description}</p>
          )}

          <div className="flex justify-center gap-6 mb-6 text-sm">
            <div>
              <p className="font-bold text-slate-800">{quiz.questionCount}</p>
              <p className="text-slate-500">Questions</p>
            </div>
            <div>
              <p className="font-bold text-xp-gold flex items-center gap-1">
                <Star className="w-4 h-4 fill-xp-gold" />
                {quiz.xpReward}
              </p>
              <p className="text-slate-500">XP Reward</p>
            </div>
          </div>

          <Button onClick={() => setShowStart(false)} size="lg" className="w-full">
            Start Quiz
          </Button>
        </Card>
      </div>
    )
  }

  // Results screen
  if (result) {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <Card padding="lg" className="text-center">
          <div
            className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4',
              result.passed ? 'bg-emerald-100' : 'bg-red-100'
            )}
          >
            {result.passed ? (
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            ) : (
              <XCircle className="w-10 h-10 text-red-500" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {result.passed ? 'Quiz Passed!' : 'Keep Practicing!'}
          </h2>

          <p className="text-3xl font-bold text-primary-600 mb-4">
            {result.score}/{result.total}
          </p>

          {result.xpEarned > 0 && (
            <Badge variant="warning" className="text-lg px-4 py-2 mb-6">
              <Star className="w-4 h-4 mr-1 fill-xp-gold" />
              +{result.xpEarned} XP
            </Badge>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => navigate(`/app/courses/${courseId}/lessons/${lessonId}`)}
              className="w-full"
            >
              Continue Learning
            </Button>

            {!result.passed && (
              <Button
                variant="ghost"
                onClick={() => {
                  setResult(null)
                  setAnswers(new Map())
                  setCurrentQuestionIndex(0)
                  setShowStart(true)
                }}
                className="w-full"
              >
                Try Again
              </Button>
            )}
          </div>
        </Card>
      </div>
    )
  }

  // Quiz questions
  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-slate-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="font-medium text-primary-600">
            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
          </span>
        </div>
        <ProgressBar
          value={currentQuestionIndex + 1}
          max={questions.length}
          size="sm"
          color="primary"
        />
      </div>

      {/* Question card */}
      <Card padding="lg">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          {currentQuestion.question}
        </h2>

        {/* Code snippet */}
        {currentQuestion.codeSnippet && (
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto mb-4 text-sm font-mono">
            {currentQuestion.codeSnippet}
          </pre>
        )}

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all',
                selectedAnswer === index
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-slate-200 hover:border-primary-200 hover:bg-slate-50'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                    selectedAnswer === index
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  )}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button variant="ghost" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            isLoading={submitMutation.isPending}
            disabled={answers.size !== questions.length}
          >
            Submit Quiz
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={selectedAnswer === undefined}>
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}
