import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function MCQExamRoom() {
  const { examId } = useParams()
  const navigate = useNavigate()
  const studentId = localStorage.getItem('student_id')

  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({}) // { questionId: 'A' | 'B' | 'C' | 'D' }
  const [currentQ, setCurrentQ] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    document.title = 'StudyBuddy — Exam in Progress'
  }, [])

  /* ── Load exam ── */
  useEffect(() => {
    if (!studentId) { navigate('/'); return }
    ;(async () => {
      setLoading(true)
      try {
        const res = await api.getExamDetails(examId)
        if (!res || res.exam_type !== 'mcq') { setError('Invalid MCQ exam.'); return }
        setExam(res)
        setQuestions(Array.isArray(res.questions) ? res.questions : [])
        setTimeLeft((res.duration_mins || 60) * 60)
      } catch (err) {
        setError(err.message || 'Failed to load exam')
      } finally {
        setLoading(false)
      }
    })()
  }, [examId, studentId, navigate])

  /* ── Timer ── */
  useEffect(() => {
    if (!exam || submitted) return
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleSubmit(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [exam, submitted])

  const selectOption = (qId, option) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }))
  }

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers])
  const totalQ = questions.length
  const currentQuestion = questions[currentQ]

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submitting || submitted) return
    if (!autoSubmit) { setShowConfirm(true); return }
    setShowConfirm(false)
    setSubmitting(true)
    clearInterval(timerRef.current)
    try {
      const payload = {
        exam_id: examId,
        student_id: studentId,
        answers: questions.map((q) => ({
          question_id: q.id,
          selected_option: answers[q.id] || null,
        })),
      }
      const res = await api.submitMCQExam(payload)
      setResult(res)
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Submission failed')
      setSubmitting(false)
    }
  }, [submitting, submitted, examId, studentId, questions, answers])

  const confirmSubmit = () => handleSubmit(true)

  /* ── RENDER ── */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] text-stone-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] text-stone-800 flex items-center justify-center">
        <div className="border border-[#E6E1DA] bg-white p-6 rounded-2xl shadow-sm max-w-md text-center">
          <p className="text-sm text-red-600 font-semibold">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 border border-[#E6E1DA] bg-[#FCFBF8] hover:bg-[#F6F4EF] text-stone-700 font-semibold px-4 py-2 rounded-xl transition-all shadow-sm text-xs"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] text-stone-800 flex items-center justify-center p-6">
        <div className="border border-[#E6E1DA] bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-stone-800 mb-2 font-clash">Exam Submitted!</h2>
          <p className="text-3xl font-bold text-orange-500 mb-1">{result.total_score} / {result.total_marks}</p>
          <p className="text-sm text-stone-500 mb-1 font-medium">{result.correct_count} correct out of {totalQ} questions</p>
          {result.rank && <p className="text-sm text-orange-600 font-bold mt-2">Rank: #{result.rank}</p>}
          <button
            onClick={() => navigate(-1)}
            className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl shadow-sm transition-colors text-sm"
          >
            Back to Class
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-stone-800 flex flex-col">
      <header className="h-14 flex-shrink-0 px-4 flex items-center justify-between bg-[#F6F4EF] border-b border-[#E6E1DA] shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-stone-800 font-clash">{exam?.title || 'MCQ Exam'}</h1>
          <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-600">MCQ</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-mono font-semibold px-3 py-1 rounded-lg border ${timeLeft < 300 ? 'text-red-600 border-red-200 bg-red-50 animate-pulse' : 'text-stone-800 border-[#E6E1DA] bg-white'}`}>
            {formatTime(timeLeft)}
          </span>
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-xl shadow-sm text-xs disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-56 border-r border-[#E6E1DA] bg-[#F6F4EF] p-4 flex flex-col flex-shrink-0">
          <p className="text-xs text-stone-500 mb-3 font-semibold">{answeredCount}/{totalQ} answered</p>
          <div className="grid grid-cols-5 gap-2 flex-1 content-start">
            {questions.map((q, i) => {
              const isAnswered = !!answers[q.id]
              const isCurrent = i === currentQ
              let classes = 'bg-white text-stone-400 border border-[#E6E1DA]'
              if (isCurrent) classes = 'bg-orange-500 text-white border border-orange-500 shadow-sm'
              else if (isAnswered) classes = 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]'
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQ(i)}
                  className={`rounded-lg w-10 h-10 text-xs font-semibold transition-all ${classes}`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
          <div className="mt-4 space-y-1.5 text-[11px] text-stone-500 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#FFF7ED] border border-[#FED7AA] inline-block" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-white border border-[#E6E1DA] inline-block" />
              <span>Not answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-orange-500 inline-block" />
              <span>Current</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto bg-[#FCFBF8]">
          {currentQuestion && (
            <div className="max-w-2xl mx-auto">
              <p className="text-xs text-stone-400 mb-2 font-medium">Question {currentQ + 1} of {totalQ} · {currentQuestion.marks || 1} mark(s)</p>
              <h2 className="text-xl font-semibold text-stone-800 mb-6 font-clash leading-snug">{currentQuestion.question_text}</h2>

              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map((opt) => {
                  const optKey = `option_${opt.toLowerCase()}`
                  const isSelected = answers[currentQuestion.id] === opt
                  return (
                    <button
                      key={opt}
                      onClick={() => selectOption(currentQuestion.id, opt)}
                      className={`w-full text-left rounded-xl border p-4 transition-all shadow-sm ${
                        isSelected
                          ? 'border-orange-500 bg-[#FFF7ED] text-stone-900 font-semibold'
                          : 'border-[#E6E1DA] bg-white text-stone-700 hover:border-orange-300 hover:-translate-y-0.5'
                      }`}
                    >
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full mr-3 text-sm font-bold ${
                        isSelected ? 'bg-orange-500 text-white' : 'bg-[#F6F4EF] text-stone-500 border border-[#E6E1DA]'
                      }`}>{opt}</span>
                      {currentQuestion[optKey] || ''}
                    </button>
                  )
                })}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                  disabled={currentQ === 0}
                  className="border border-[#E6E1DA] bg-white hover:bg-[#F6F4EF] text-stone-700 font-semibold px-4 py-2 rounded-xl transition-all shadow-sm text-xs disabled:opacity-40"
                >
                  Previous
                </button>
                {currentQ < totalQ - 1 ? (
                  <button
                    onClick={() => setCurrentQ(currentQ + 1)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-xl shadow-sm text-xs transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-xl shadow-sm text-xs disabled:opacity-50 transition-colors"
                  >
                    Finish & Submit
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm px-4 animate-fade-in">
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-stone-850 mb-2 font-clash">Submit Exam?</h3>
            <p className="text-sm text-stone-600 mb-1">You have answered {answeredCount} of {totalQ} questions.</p>
            {answeredCount < totalQ && (
              <p className="text-sm text-orange-600 font-semibold mb-3">{totalQ - answeredCount} question(s) unanswered!</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="border border-[#E6E1DA] bg-white text-stone-700 font-semibold rounded-xl hover:bg-[#F6F4EF] flex-1 text-xs px-3 py-2.5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-sm flex-1 text-xs px-3 py-2.5 transition-colors"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
