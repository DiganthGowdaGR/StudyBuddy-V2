import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function WrittenExamRoom() {
  const { examId } = useParams()
  const navigate = useNavigate()
  const studentId = localStorage.getItem('student_id')

  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({}) // { questionId: 'answer text' }
  const [currentQ, setCurrentQ] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
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
        if (!res || res.exam_type !== 'written') { setError('Invalid written exam.'); return }
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

  const updateAnswer = (qId, text) => {
    setAnswers((prev) => ({ ...prev, [qId]: text }))
  }

  const answeredCount = Object.values(answers).filter((v) => v.trim().length > 0).length
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
          answer_text: answers[q.id] || '',
        })),
      }
      await api.submitWrittenExam(payload)
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Submission failed')
      setSubmitting(false)
    }
  }, [submitting, submitted, examId, studentId, questions, answers])

  const confirmSubmit = () => handleSubmit(true)

  const wordCount = (text) => (text || '').trim().split(/\s+/).filter(Boolean).length

  /* ── RENDER ── */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] text-stone-850 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] text-stone-800 flex items-center justify-center">
        <div className="border border-[#E6E1DA] bg-white p-6 rounded-2xl shadow-sm max-w-md text-center">
          <p className="text-sm text-red-650 font-semibold">{error}</p>
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] text-stone-850 flex items-center justify-center p-6">
        <div className="border border-[#E6E1DA] bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-stone-800 mb-2 font-clash">Exam Submitted!</h2>
          <p className="text-sm text-stone-500 mb-4 font-medium">Your answers have been submitted for review. The teacher will grade your responses and scores will be updated.</p>
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 mb-6">
            <p className="text-xs text-amber-700 font-semibold">Grading in progress — check back later for your score.</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl shadow-sm transition-colors text-sm"
          >
            Back to Class
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-stone-800 flex flex-col">
      {/* HEADER */}
      <header className="h-14 flex-shrink-0 px-4 flex items-center justify-between bg-[#F6F4EF] border-b border-[#E6E1DA] shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-stone-800 font-clash">{exam?.title || 'Written Exam'}</h1>
          <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs text-orange-600 font-bold border border-orange-200">Written</span>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-sm font-mono font-semibold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-stone-800'}`}>
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
        {/* QUESTION NAVIGATOR */}
        <aside className="w-52 border-r border-[#E6E1DA] bg-[#F6F4EF] p-4 flex flex-col flex-shrink-0">
          <p className="text-xs text-stone-500 mb-3 font-semibold">{answeredCount}/{totalQ} answered</p>
          <div className="space-y-1.5 flex-1 overflow-y-auto">
            {questions.map((q, i) => {
              const hasAnswer = (answers[q.id] || '').trim().length > 0
              const isCurrent = i === currentQ
              let bg = 'bg-white text-stone-400 border border-[#E6E1DA]'
              if (isCurrent) bg = 'bg-orange-500 text-white border-orange-500 shadow-sm'
              else if (hasAnswer) bg = 'bg-emerald-50 text-emerald-700 border border-emerald-250 font-medium'
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQ(i)}
                  className={`w-full text-left rounded-lg px-3 py-2 text-xs font-semibold ${bg} hover:border-orange-500 transition-colors`}
                >
                  Q{i + 1}
                  {hasAnswer && <span className="ml-1 text-[10px] text-emerald-600 font-bold">({wordCount(answers[q.id])} words)</span>}
                </button>
              )
            })}
          </div>
          <div className="mt-4 space-y-1.5 text-[10px] text-stone-500 font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-250 inline-block" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-white border border-[#E6E1DA] inline-block" />
              <span>Not answered</span>
            </div>
          </div>
        </aside>

        {/* ANSWER AREA */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#FCFBF8]">
          {currentQuestion && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-stone-400 font-medium">Question {currentQ + 1} of {totalQ} · {currentQuestion.max_marks} mark(s)</p>
                <p className="text-xs text-stone-500 font-bold">{wordCount(answers[currentQuestion.id])} words</p>
              </div>
              <h2 className="text-xl font-semibold text-stone-800 mb-5 font-clash leading-snug">{currentQuestion.question_text}</h2>

              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                placeholder="Write your answer here..."
                rows={12}
                className="w-full rounded-xl border border-[#E6E1DA] bg-white px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-y shadow-sm"
              />

              <div className="flex justify-between mt-6">
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

      {/* CONFIRM MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm px-4">
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-stone-850 mb-2 font-clash">Submit Exam?</h3>
            <p className="text-sm text-stone-600 mb-1">You have answered {answeredCount} of {totalQ} questions.</p>
            {answeredCount < totalQ && (
              <p className="text-sm text-orange-600 font-semibold mb-3">{totalQ - answeredCount} question(s) unanswered!</p>
            )}
            <p className="text-xs text-stone-400 mb-4 font-medium leading-relaxed">Written exams are graded by the teacher. Your AI-assisted scores will be available after review.</p>
            <div className="flex gap-3">
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
