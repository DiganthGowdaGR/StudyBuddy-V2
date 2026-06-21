import React, { useMemo, useState } from 'react'
import StudyHeatmap from './StudyHeatmap'

function getGreeting(name) {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return `Good morning, ${name} ☀️`
  if (hour >= 12 && hour < 17) return `Good afternoon, ${name} 👋`
  if (hour >= 17 && hour < 21) return `Good evening, ${name} 🌙`
  return `Studying late, ${name}? 🌟`
}

function getDailyQuote() {
  const quotes = [
    'Every expert was once a beginner.',
    'Progress, not perfection.',
    'One more page. One more concept.',
    'Your future self is watching.',
    'Consistency beats intensity.',
    'Small steps every day.',
    'The best time to study is now.'
  ]

  return quotes[new Date().getDay()]
}

function TrashIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M4.7 5.8h10.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 5.8V4.6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.2 5.8 6.8 15a1.3 1.3 0 0 0 1.3 1.2h3.8a1.3 1.3 0 0 0 1.3-1.2l.6-9.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8.6 8.4v5.2M11.4 8.4v5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function formatDateKey(date) {
  return date.toISOString().slice(0, 10)
}

function normalizeDateKey(value) {
  const text = String(value || '').trim()
  if (!text) return ''
  return text.length >= 10 ? text.slice(0, 10) : ''
}

function toMinutes(timeText) {
  const [h = '0', m = '0'] = String(timeText || '').split(':')
  const hours = Number(h)
  const mins = Number(m)

  if (Number.isNaN(hours) || Number.isNaN(mins)) return null
  return hours * 60 + mins
}

function calculateDuration(startTime, endTime) {
  const startMinutes = toMinutes(startTime)
  const endMinutes = toMinutes(endTime)

  if (startMinutes === null || endMinutes === null) return 45
  if (startMinutes === endMinutes) return 45

  if (endMinutes > startMinutes) {
    return endMinutes - startMinutes
  }

  return 24 * 60 - startMinutes + endMinutes
}

function getLastDays(count) {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = count - 1; i >= 0; i -= 1) {
    const day = new Date(today)
    day.setDate(today.getDate() - i)
    days.push(day)
  }

  return days
}

function buildStudySeries(sessions, scheduleEvents, reviewHistory, dayCount = 7) {
  const days = getLastDays(dayCount)
  const map = new Map(days.map((day) => [formatDateKey(day), 0]))

  sessions.forEach((session) => {
    const createdAt = new Date(session.created_at)
    if (Number.isNaN(createdAt.getTime())) return

    const key = formatDateKey(createdAt)
    if (!map.has(key)) return

    const duration = Number(session.duration_mins) || 45
    map.set(key, map.get(key) + duration)
  })

  scheduleEvents.forEach((event) => {
    const key = normalizeDateKey(event.date)
    if (!map.has(key)) return

    const duration = calculateDuration(event.startTime, event.endTime)
    map.set(key, map.get(key) + duration)
  })

  const history = reviewHistory && typeof reviewHistory === 'object' ? reviewHistory : {}
  Object.entries(history).forEach(([key, count]) => {
    if (!map.has(key)) return

    const reviewCount = Number(count) || 0
    if (reviewCount <= 0) return

    const estimatedMinutes = Math.min(reviewCount * 5, 60)
    if ((map.get(key) || 0) === 0) {
      map.set(key, estimatedMinutes)
    }
  })

  return days.map((day) => {
    const key = formatDateKey(day)
    return {
      key,
      minutes: map.get(key) || 0,
      label: day.toLocaleDateString(undefined, { weekday: 'short' }),
      shortDate: day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    }
  })
}

export default function HomeView({
  studentName,
  sessions,
  customEvents,
  documents,
  reviewStats,
  workspaces,
  activeWorkspaceId,
  onOpenWorkspace,
  onCreateWorkspace,
  onDeleteWorkspace,
}) {
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceError, setWorkspaceError] = useState('')
  const displayName = (studentName || 'Student').trim()
  const heroGreeting = getGreeting(displayName)
  const dailyQuote = getDailyQuote()

  const studySeries = useMemo(
    () => buildStudySeries(sessions, customEvents, reviewStats.history, 7),
    [sessions, customEvents, reviewStats.history]
  )

  const totalMinutes = studySeries.reduce((sum, item) => sum + item.minutes, 0)
  const activeStudyDays = studySeries.filter((item) => item.minutes > 0).length
  const avgMinsPerStudyDay = activeStudyDays > 0 ? Math.round(totalMinutes / activeStudyDays) : 0
  const trackedSessions = sessions.length > 0
    ? sessions.length
    : customEvents.length > 0
      ? customEvents.length
      : activeStudyDays

  const statCards = [
    {
      label: 'STUDY DAYS',
      value: activeStudyDays,
      desc: 'Active in last 7 days',
      icon: '📅',
      accent: 'bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.25)] text-[#F59E0B]',
    },
    {
      label: 'AVERAGE',
      value: `${avgMinsPerStudyDay}m`,
      desc: 'Per active study day',
      icon: '⏱',
      accent: 'bg-[rgba(251,146,60,0.1)] border border-[rgba(251,146,60,0.25)] text-[#FB923C]',
    },
    {
      label: 'SESSIONS',
      value: trackedSessions,
      desc: 'Recent tracked sessions',
      icon: '🔄',
      accent: 'bg-[rgba(249,115,22,0.12)] border border-[rgba(249,115,22,0.25)] text-[#F97316]',
    },
    {
      label: 'RESOURCES',
      value: documents.length,
      desc: 'Uploaded study files',
      icon: '📁',
      accent: 'bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.28)] text-[#34D399]',
    },
  ]

  const handleCreateWorkspace = async () => {
    const name = workspaceName.trim()
    if (!name) {
      setWorkspaceError('Workspace name is required.')
      return
    }

    try {
      await onCreateWorkspace(name)
      setWorkspaceName('')
      setWorkspaceError('')
    } catch (err) {
      setWorkspaceError(err.message || 'Could not create workspace.')
    }
  }

  const handleDeleteWorkspace = async (workspaceId) => {
    try {
      await onDeleteWorkspace(workspaceId)
      setWorkspaceError('')
    } catch (err) {
      setWorkspaceError(err.message || 'Could not delete workspace.')
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-transparent p-6 pb-24 space-y-8 text-[#292524]">
      <section className="rounded-2xl border border-[#E6E1DA] bg-gradient-to-b from-[rgba(249,115,22,0.02)] to-transparent p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col gap-3">
          <span className="sb-badge" style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316', borderColor: 'rgba(249,115,22,0.2)' }}>HOME</span>
          <h2 className="text-4xl font-bold text-[#1C1917]">{heroGreeting}</h2>
          <p className="text-sm text-[#78716C]">Track your study flow and jump into your workspace.</p>
          <p className="text-sm italic text-[#78716C] border-l-2 border-[#E6E1DA] pl-3">{dailyQuote}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <article key={card.label} className="sb-card">
            <div className="flex items-start justify-between">
              <div className="text-[11px] uppercase tracking-[0.12em] text-[#78716C]">{card.label}</div>
              <span className={`h-10 w-10 ${card.accent} rounded-xl grid place-items-center text-lg shadow-[0_0_20px_rgba(249,115,22,0.1)]`} aria-hidden="true">{card.icon}</span>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#1C1917]">{card.value}</p>
            <p className="text-xs text-[#78716C] mt-1">{card.desc}</p>
          </article>
        ))}
      </section>

      <section className="sb-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="sb-title-md">Study Activity</p>
            <p className="text-xs text-[#78716C]">Last 12 months • weekly heatmap</p>
          </div>
          <span className="sb-badge warning">Streak {reviewStats.streakDays}d</span>
        </div>

        <div className="mt-5">
          <StudyHeatmap studentId={localStorage.getItem('student_id')} />
        </div>
      </section>

      <section className="sb-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="sb-title-md">My Workspaces</p>
            <p className="text-xs text-[#78716C]">Create workspace cards and open from here</p>
          </div>
          <button
            type="button"
            onClick={handleCreateWorkspace}
            className="sb-btn-primary text-sm px-4 py-2"
          >
            + New Workspace
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleCreateWorkspace()
              }
            }}
            placeholder="Workspace name"
            className="sb-input w-full md:w-72"
          />

          <button
            type="button"
            onClick={handleCreateWorkspace}
            className="sb-btn-secondary text-sm px-4 py-2"
          >
            Create
          </button>
        </div>

        {workspaceError && <p className="mt-2 text-xs text-red-400">{workspaceError}</p>}

        {workspaces.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-[#E6E1DA] bg-[#F6F4EF] px-6 py-10 text-center">
            <p className="text-sm text-[#78716C]">No workspaces yet</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {workspaces.map((workspace) => {
              const isActive = workspace.id === activeWorkspaceId
              return (
                <article
                  key={workspace.id}
                  className={`rounded-xl border p-4 transition-all ${
                    isActive
                      ? 'border-[#F97316] bg-white shadow-[0_4px_20px_rgba(249,115,22,0.08)]'
                      : 'border-[#E6E1DA] bg-white hover:border-[#F97316]/70 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#1C1917]">{workspace.name}</p>
                      <p className="text-[11px] text-[#78716C] mt-1">Workspace ready</p>
                    </div>
                    {isActive && (
                      <span className="sb-badge" style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316', borderColor: 'rgba(249,115,22,0.2)' }}>Active</span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenWorkspace(workspace.id)}
                      className="flex-1 rounded-lg border border-[#E6E1DA] bg-[#F6F4EF] text-[#292524] text-sm py-2 hover:border-[#F97316] hover:bg-[#FFF7ED] hover:text-[#F97316] transition-all"
                    >
                      Open
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteWorkspace(workspace.id)}
                      disabled={workspaces.length <= 1}
                      title="Delete workspace"
                      aria-label="Delete workspace"
                      className="rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] p-2.5 transition-all hover:bg-[rgba(239,68,68,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
