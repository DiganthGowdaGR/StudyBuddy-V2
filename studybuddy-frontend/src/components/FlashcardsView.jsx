import React, { useEffect, useMemo, useState } from 'react'
import ProgressRing from './ProgressRing'

function TrashIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M4.7 5.8h10.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 5.8V4.6a1 1 0 0 1 1-1h2a1 1 0 0 1 1-1v1.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.2 5.8 6.8 15a1.3 1.3 0 0 0 1.3 1.2h3.8a1.3 1.3 0 0 0 1.3-1.2l.6-9.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8.6 8.4v5.2M11.4 8.4v5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function FlipIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M16 3h5v5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 21H3v-5" />
    </svg>
  )
}

function getUniqueSubjects(flashcards) {
  const subjectSet = new Set()
  flashcards.forEach((card) => subjectSet.add(card.subject || 'General'))
  return Array.from(subjectSet)
}

function truncateText(value, maxLength = 96) {
  const text = String(value || '').trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1)}...`
}

function getDailyGoalTarget(totalCards) {
  if (totalCards <= 0) return 10
  return Math.min(30, Math.max(10, totalCards * 2))
}

export default function FlashcardsView({
  flashcards,
  reviewStats,
  onCreateCard,
  onGenerateAnswer,
  onToggleMastered,
  onMarkReviewed,
  onDeleteCard,
}) {
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false)
  const [form, setForm] = useState({ subject: '', question: '', answer: '' })

  const subjects = useMemo(() => getUniqueSubjects(flashcards), [flashcards])

  const filteredCards = useMemo(() => {
    if (subjectFilter === 'all') return flashcards
    return flashcards.filter((card) => (card.subject || 'General') === subjectFilter)
  }, [flashcards, subjectFilter])

  useEffect(() => {
    setCurrentIndex((prev) => {
      if (filteredCards.length === 0) return 0
      return Math.min(prev, filteredCards.length - 1)
    })
  }, [filteredCards.length])

  const boundedIndex = filteredCards.length > 0
    ? Math.min(currentIndex, filteredCards.length - 1)
    : 0

  const activeCard = filteredCards[boundedIndex] || null
  const masteredCount = flashcards.filter((card) => card.mastered).length
  const masteryPercent = flashcards.length > 0 ? Math.round((masteredCount / flashcards.length) * 100) : 0
  const dailyGoalTarget = getDailyGoalTarget(flashcards.length)
  const dailyGoalPercent = Math.min(100, Math.round((reviewStats.todayReviews / dailyGoalTarget) * 100))

  const handleFlip = () => {
    if (!activeCard) return
    if (!showAnswer) {
      onMarkReviewed(activeCard.id)
    }
    setShowAnswer((prev) => !prev)
    setActionMessage('')
    setActionError('')
  }

  const handleShowFront = () => {
    setShowAnswer(false)
    setActionMessage('')
    setActionError('')
  }

  const handleShowBack = () => {
    if (!activeCard) return
    if (!showAnswer) {
      onMarkReviewed(activeCard.id)
    }
    setShowAnswer(true)
    setActionMessage('')
    setActionError('')
  }

  const handleNext = () => {
    if (filteredCards.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length)
    setShowAnswer(false)
  }

  const handlePrev = () => {
    if (filteredCards.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length)
    setShowAnswer(false)
  }

  const handleSelectCard = (index) => {
    if (index < 0 || index >= filteredCards.length) return
    setCurrentIndex(index)
    setShowAnswer(false)
    setActionError('')
    setActionMessage('')
  }

  const handleMastered = async () => {
    if (!activeCard) return

    try {
      await onToggleMastered(activeCard.id)
      setActionMessage(activeCard.mastered ? 'Marked as learning' : 'Marked as mastered')
      setActionError('')
    } catch (err) {
      setActionError(err.message || 'Could not update this card right now.')
      setActionMessage('')
    }
  }

  const handleShare = async () => {
    if (!activeCard) return
    try {
      await navigator.clipboard.writeText(`Q: ${activeCard.question}\nA: ${activeCard.answer}`)
      setActionMessage('Card copied to clipboard.')
      setActionError('')
    } catch {
      setActionError('Clipboard permission blocked. Copy manually.')
      setActionMessage('')
    }
  }

  const handleDelete = async () => {
    if (!activeCard || !onDeleteCard) return

    try {
      await onDeleteCard(activeCard.id)
      setActionMessage('Flashcard deleted.')
      setActionError('')
      setShowAnswer(false)
      setCurrentIndex(0)
    } catch (err) {
      setActionError(err.message || 'Could not delete this card right now.')
      setActionMessage('')
    }
  }

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in inputs/textareas
      const activeEl = document.activeElement
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        return
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        handleFlip()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault()
        handleMastered()
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault()
        handleShowFront()
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault()
        handleShowBack()
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault()
        handleShare()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeCard, showAnswer, filteredCards, currentIndex])

  const handleCreateCard = async (e) => {
    e.preventDefault()
    const payload = {
      subject: (form.subject.trim() || 'General'),
      question: form.question.trim(),
      answer: form.answer.trim(),
    }

    if (!payload.question || !payload.answer) {
      setActionError('Question and answer are required.')
      return
    }

    try {
      await onCreateCard(payload)
      setForm({ subject: '', question: '', answer: '' })
      setShowCreateForm(false)
      setActionMessage('Flashcard created.')
      setActionError('')
      setSubjectFilter('all')
      setCurrentIndex(0)
      setShowAnswer(false)
    } catch (err) {
      setActionError(err.message || 'Could not create flashcard right now.')
      setActionMessage('')
    }
  }

  const handleGenerateAnswer = async () => {
    if (!onGenerateAnswer) return

    const question = form.question.trim()
    if (!question) {
      setActionError('Enter a question first to generate an answer.')
      setActionMessage('')
      return
    }

    try {
      setIsGeneratingAnswer(true)
      setActionError('')
      setActionMessage('')

      const generated = await onGenerateAnswer({
        subject: form.subject.trim() || 'General',
        question,
      })

      const answer = String(generated || '').trim()
      if (!answer) {
        setActionError('AI could not generate an answer. Try rephrasing the question.')
        return
      }

      setForm((prev) => ({ ...prev, answer }))
      setActionMessage('AI answer generated. Review it, then save.')
    } catch (err) {
      setActionError(err.message || 'Could not generate answer right now.')
      setActionMessage('')
    } finally {
      setIsGeneratingAnswer(false)
    }
  }

  return (
    <div className="h-full flex bg-[#FCFBF8] text-[#292524] rounded-2xl overflow-hidden border border-[#E6E1DA]">
      {/* Sidebar Subjects */}
      <aside className="w-64 border-r border-[#E6E1DA] bg-[#FDFCFB] p-5 space-y-6 overflow-y-auto flex-shrink-0">
        <div>
          <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Decks & Subjects</p>
          <div className="mt-3 space-y-1">
            <button
              type="button"
              onClick={() => {
                setSubjectFilter('all')
                setCurrentIndex(0)
                setShowAnswer(false)
              }}
              className={`w-full text-left rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                subjectFilter === 'all'
                  ? 'bg-[#FFF7ED] text-[#F97316] border border-[#FDBA74] shadow-[0_2px_8px_rgba(249,115,22,0.04)]'
                  : 'bg-transparent text-[#78716C] border border-transparent hover:bg-[#F6F4EF] hover:text-[#1C1917]'
              }`}
            >
              <span>All Subjects</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${subjectFilter === 'all' ? 'bg-[#F97316]/10 text-[#F97316]' : 'bg-[#E6E1DA]/50 text-[#78716C]'}`}>
                {flashcards.length}
              </span>
            </button>

            {subjects.length > 0 ? (
              subjects.map((subject) => {
                const count = flashcards.filter((card) => (card.subject || 'General') === subject).length
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => {
                      setSubjectFilter(subject)
                      setCurrentIndex(0)
                      setShowAnswer(false)
                    }}
                    className={`w-full text-left rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                      subjectFilter === subject
                        ? 'bg-[#FFF7ED] text-[#F97316] border border-[#FDBA74] shadow-[0_2px_8px_rgba(249,115,22,0.04)]'
                        : 'bg-transparent text-[#78716C] border border-transparent hover:bg-[#F6F4EF] hover:text-[#1C1917]'
                    }`}
                  >
                    <span className="truncate mr-2">{subject}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${subjectFilter === subject ? 'bg-[#F97316]/10 text-[#F97316]' : 'bg-[#E6E1DA]/50 text-[#78716C]'}`}>
                      {count}
                    </span>
                  </button>
                )
              })
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#E6E1DA] pt-5">
          <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Session Mastery</p>
          <div className="mt-3 bg-[#FCFBF8] rounded-xl border border-[#E6E1DA] p-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-[#F97316]" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                {masteryPercent}%
              </span>
              <span className="text-xs text-[#78716C]">completion</span>
            </div>
            <div className="w-full bg-[#E6E1DA] h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#F97316] to-[#FB923C] h-full rounded-full transition-all duration-500"
                style={{ width: `${masteryPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-[#78716C] mt-1 font-medium">
              🏆 {masteredCount} of {flashcards.length} cards mastered
            </p>
          </div>
        </div>

        <div className="border-t border-[#E6E1DA] pt-5">
          <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Retention Streak</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <p className="text-lg font-bold text-[#1C1917]" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                {reviewStats.streakDays} Day{reviewStats.streakDays !== 1 ? 's' : ''}
              </p>
              <p className="text-[10px] text-[#78716C]">Review daily to guard memory</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Review Area */}
      <main className="flex-1 p-8 overflow-y-auto relative flex flex-col justify-between">
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative z-10 space-y-6">
          {/* Top Panel Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-[#1C1917] tracking-tight" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                Flashcard Studio
              </h2>
              <p className="text-xs text-[#78716C] mt-1 font-medium">
                Train your active recall using spatial feedback and memory markers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCreateForm((prev) => !prev)
                setActionError('')
                setActionMessage('')
              }}
              className="px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold shadow-sm hover:bg-[#EA580C] hover:shadow-md active:scale-95 transition-all duration-200 flex items-center gap-1.5"
            >
              {showCreateForm ? 'Cancel Creation' : '＋ Create Flashcard'}
            </button>
          </div>

          {/* Create Flashcard Box */}
          {showCreateForm && (
            <form onSubmit={handleCreateCard} className="rounded-2xl border border-[#E6E1DA] bg-white p-5 space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all">
              <p className="text-xs font-bold text-[#F97316] uppercase tracking-wider">Add New Study Card</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1 flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#78716C] uppercase">Subject / Tag</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g. Immunology, Calculus"
                    className="bg-[#FCFBF8] border border-[#E6E1DA] rounded-xl px-3.5 py-2 text-sm text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#F97316] focus:border-[#F97316]"
                  />
                </div>
                <div className="md:col-span-2" />

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#78716C] uppercase">Question (Front)</label>
                  <textarea
                    value={form.question}
                    onChange={(e) => setForm((prev) => ({ ...prev, question: e.target.value }))}
                    placeholder="Ask a conceptual question..."
                    rows={3}
                    className="bg-[#FCFBF8] border border-[#E6E1DA] rounded-xl px-3.5 py-2 text-sm text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#F97316] focus:border-[#F97316] resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-[#78716C] uppercase">Answer (Back)</label>
                  <textarea
                    value={form.answer}
                    onChange={(e) => setForm((prev) => ({ ...prev, answer: e.target.value }))}
                    placeholder="Detail the answer or explanation..."
                    rows={3}
                    className="bg-[#FCFBF8] border border-[#E6E1DA] rounded-xl px-3.5 py-2 text-sm text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#F97316] focus:border-[#F97316] resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#E6E1DA] pt-3">
                <p className="text-red-500 text-xs font-medium">{actionError}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateAnswer}
                    disabled={isGeneratingAnswer || !onGenerateAnswer}
                    className="px-4 py-2 rounded-xl bg-[#F6F4EF] border border-[#E6E1DA] text-[#292524] text-xs font-semibold hover:bg-[#EAE6DF] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {isGeneratingAnswer ? '🤖 Writing answer...' : '🤖 AI Generate Answer'}
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-[#F97316] text-white text-xs font-bold shadow-sm hover:bg-[#EA580C] transition-all">
                    Save Card
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Flashcard Container Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
            <div className="space-y-6">
              {/* Physical Flashcard UI wrapper */}
              <div className="relative">
                {activeCard ? (
                  <div
                    onClick={(e) => {
                      // Don't flip if clicking buttons
                      if (e.target.closest('button')) return
                      handleFlip()
                    }}
                    title="Click card to flip"
                    className="group relative w-full min-h-[380px] rounded-3xl border border-[#E6E1DA] bg-white shadow-[0_12px_36px_rgba(41,37,36,0.03)] cursor-pointer hover:shadow-[0_16px_44px_rgba(41,37,36,0.06)] hover:border-[#FDBA74]/50 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    {/* Index Card Top Line Decoration */}
                    <div className="h-2 w-full bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#FDBA74]" />

                    {/* Card Header metadata */}
                    <div className="px-6 py-4 flex items-center justify-between border-b border-[#F6F4EF]">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-[#FFF7ED] border border-[#FDBA74]/30 px-3 py-1 text-[10px] font-bold text-[#F97316] uppercase tracking-wider">
                          {activeCard.subject || 'General'}
                        </span>
                        <span className="text-xs text-[#78716C] font-semibold">
                          Card {boundedIndex + 1} of {filteredCards.length}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMastered()
                        }}
                        className={`text-[10px] font-bold uppercase tracking-wider rounded-lg px-3 py-1 border transition-all duration-200 ${
                          activeCard.mastered
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                            : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-[#FFF7ED] hover:border-[#FDBA74] hover:text-[#F97316]'
                        }`}
                      >
                        {activeCard.mastered ? '✓ Mastered' : '★ Mark Mastered'}
                      </button>
                    </div>

                    {/* Card Body content */}
                    <div className="px-8 py-10 flex-1 flex flex-col justify-center items-center text-center">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#A8A29E] mb-4">
                        {showAnswer ? 'Back • Correct Answer' : 'Front • Question Prompt'}
                      </p>

                      <div className="max-w-2xl mx-auto min-h-[120px] flex items-center justify-center">
                        {showAnswer ? (
                          <p
                            className="text-2xl md:text-3xl text-[#EA580C] leading-relaxed whitespace-pre-wrap break-words italic"
                            style={{ fontFamily: 'Cormorant Garamond, serif' }}
                          >
                            {activeCard.answer}
                          </p>
                        ) : (
                          <p
                            className="text-xl md:text-2xl font-bold text-[#1C1917] leading-snug whitespace-pre-wrap break-words tracking-tight"
                            style={{ fontFamily: 'Clash Display, sans-serif' }}
                          >
                            {activeCard.question}
                          </p>
                        )}
                      </div>

                      <div className="mt-8 text-[11px] text-[#A8A29E] font-medium flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <FlipIcon className="h-3 w-3" />
                        <span>Click anywhere on card to flip</span>
                      </div>
                    </div>

                    {/* Card Footer Control Buttons */}
                    <div className="px-6 py-4 bg-[#FCFBF8] border-t border-[#F6F4EF] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePrev()
                        }}
                        className="px-4 py-2 rounded-xl bg-white border border-[#E6E1DA] hover:bg-[#F6F4EF] text-stone-700 text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
                      >
                        ← Prev
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFlip()
                        }}
                        className="px-5 py-2.5 rounded-xl bg-white border-2 border-[#F97316] text-[#F97316] hover:bg-[#FFF7ED] text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                      >
                        <FlipIcon className="h-3.5 w-3.5" />
                        {showAnswer ? 'Show Question' : 'Show Answer'}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNext()
                        }}
                        className="px-4 py-2 rounded-xl bg-white border border-[#E6E1DA] hover:bg-[#F6F4EF] text-stone-700 text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-[#E6E1DA] bg-white min-h-[380px] p-8 flex items-center justify-center text-center shadow-sm">
                    <div>
                      <span className="text-4xl">🗂</span>
                      <h3 className="mt-3 text-lg font-bold text-[#1C1917]">No Flashcards Yet</h3>
                      <p className="text-xs text-[#78716C] mt-1 max-w-sm mx-auto">
                        Create a card using the form at the top to start reviewing concepts.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card deck slider/grid */}
              <section className="rounded-2xl border border-[#E6E1DA] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
                <div className="flex items-center justify-between gap-2 border-b border-[#F6F4EF] pb-3 mb-4">
                  <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Filtered Deck Grid</p>
                  <p className="text-xs text-[#F97316] font-bold">{filteredCards.length} Cards available</p>
                </div>

                {filteredCards.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {filteredCards.map((card, index) => {
                      const isSelected = index === boundedIndex
                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => handleSelectCard(index)}
                          className={`rounded-xl border p-3.5 text-left transition-all duration-200 flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#FFF7ED] border-[#FDBA74] shadow-sm scale-[0.99]'
                              : 'bg-[#FCFBF8] border-[#E6E1DA] hover:border-[#FDBA74]/50 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${isSelected ? 'bg-[#F97316]/10 text-[#F97316]' : 'bg-[#E6E1DA]/60 text-[#78716C]'}`}>
                              Card #{index + 1}
                            </span>
                            {card.mastered && (
                              <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                                Mastered
                              </span>
                            )}
                          </div>
                          <p className="mt-3 text-xs font-bold text-[#1C1917] leading-snug line-clamp-2" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                            {card.question}
                          </p>
                          <p className="mt-1 text-[11px] text-[#78716C] line-clamp-1 italic">
                            {card.answer}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#78716C] text-center py-6">No flashcards match the current filter.</p>
                )}
              </section>
            </div>

            {/* Sidebar widgets */}
            <aside className="space-y-4">
              {/* Daily Goal card */}
              <section className="rounded-2xl border border-[#E6E1DA] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] text-center">
                <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider text-left mb-3">Daily Goal</p>
                <div className="flex justify-center my-4">
                  <ProgressRing
                    value={dailyGoalPercent}
                    size={110}
                    stroke={9}
                    trackClass="stroke-[#F6F4EF]"
                    progressClass="stroke-[#F97316]"
                    label="goal"
                  />
                </div>
                <p className="text-xs text-[#1C1917] font-semibold mt-1">
                  🎯 {reviewStats.todayReviews} / {dailyGoalTarget} reviews completed
                </p>
                <p className="text-[10px] text-[#78716C] mt-0.5 font-medium">
                  {dailyGoalPercent}% of daily practice target
                </p>
              </section>

              {/* Shortcuts panel */}
              <section className="rounded-2xl border border-[#E6E1DA] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
                <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-3">Interactive Keys</p>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between text-xs py-1 border-b border-[#F6F4EF]">
                    <span className="text-[#78716C]">Flip Card</span>
                    <kbd className="px-2 py-0.5 bg-[#F6F4EF] border border-[#E6E1DA] rounded text-[10px] font-bold text-stone-600 shadow-sm">Space</kbd>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 border-b border-[#F6F4EF]">
                    <span className="text-[#78716C]">Next Card</span>
                    <kbd className="px-2 py-0.5 bg-[#F6F4EF] border border-[#E6E1DA] rounded text-[10px] font-bold text-stone-600 shadow-sm">→</kbd>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 border-b border-[#F6F4EF]">
                    <span className="text-[#78716C]">Previous Card</span>
                    <kbd className="px-2 py-0.5 bg-[#F6F4EF] border border-[#E6E1DA] rounded text-[10px] font-bold text-stone-600 shadow-sm">←</kbd>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 border-b border-[#F6F4EF]">
                    <span className="text-[#78716C]">Toggle Mastered</span>
                    <kbd className="px-2 py-0.5 bg-[#F6F4EF] border border-[#E6E1DA] rounded text-[10px] font-bold text-stone-600 shadow-sm">M</kbd>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 border-b border-[#F6F4EF]">
                    <span className="text-[#78716C]">Show Front</span>
                    <kbd className="px-2 py-0.5 bg-[#F6F4EF] border border-[#E6E1DA] rounded text-[10px] font-bold text-stone-600 shadow-sm">F</kbd>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 border-b border-[#F6F4EF]">
                    <span className="text-[#78716C]">Show Back</span>
                    <kbd className="px-2 py-0.5 bg-[#F6F4EF] border border-[#E6E1DA] rounded text-[10px] font-bold text-stone-600 shadow-sm">B</kbd>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 border-b border-[#F6F4EF]">
                    <span className="text-[#78716C]">Copy Q&A</span>
                    <kbd className="px-2 py-0.5 bg-[#F6F4EF] border border-[#E6E1DA] rounded text-[10px] font-bold text-stone-600 shadow-sm">S</kbd>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F6F4EF] flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare()
                    }}
                    className="w-full rounded-xl bg-[#F6F4EF] hover:bg-[#EAE6DF] border border-[#E6E1DA] text-stone-700 text-xs py-2 font-semibold transition-all active:scale-95"
                  >
                    Copy Card Text
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete()
                    }}
                    disabled={!activeCard}
                    title="Delete card"
                    aria-label="Delete card"
                    className="w-full rounded-xl bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 text-red-600 hover:text-white text-xs py-2 font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Delete Current Card
                  </button>
                </div>

                {actionMessage && <p className="text-emerald-600 text-[10px] font-bold mt-2 text-center">{actionMessage}</p>}
                {actionError && <p className="text-red-500 text-[10px] font-bold mt-2 text-center">{actionError}</p>}
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
