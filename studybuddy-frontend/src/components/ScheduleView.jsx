import React, { useMemo, useState } from 'react'
import ProgressRing from './ProgressRing'

const TIMELINE_START_MINUTES = 8 * 60
const TIMELINE_END_MINUTES = 22 * 60
const TIMELINE_INTERVAL_MINUTES = 120
const TIMELINE_HEIGHT_PX = 520

// Padding insets to prevent label clipping on top/bottom edges
const TIMELINE_PADDING_Y = 18
const TIMELINE_USABLE_HEIGHT = TIMELINE_HEIGHT_PX - (TIMELINE_PADDING_Y * 2)

function getMinuteTopPx(minute) {
  const ratio = (minute - TIMELINE_START_MINUTES) / (TIMELINE_END_MINUTES - TIMELINE_START_MINUTES)
  return TIMELINE_PADDING_Y + ratio * TIMELINE_USABLE_HEIGHT
}

function PlusIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

// Fixed CloseIcon
function CloseIcon({ className = 'h-3 w-3' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function getMonday(date) {
  const copy = new Date(date)
  const day = copy.getDay()
  const diff = day === 0 ? -6 : 1 - day
  copy.setDate(copy.getDate() + diff)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function addDays(date, days) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatWeekRange(startDate) {
  const endDate = addDays(startDate, 6)
  const startLabel = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endLabel = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `Week of ${startLabel} - ${endLabel}`
}

function formatDayName(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

function formatDayNumber(date) {
  return date.getDate()
}

function formatAgendaDate(dateKey) {
  const parsed = new Date(`${dateKey}T00:00:00`)
  return parsed.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function toMinutes(timeText) {
  const [hours = '0', minutes = '0'] = (timeText || '').split(':')
  const h = Number(hours)
  const m = Number(minutes)

  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

function formatTimeLabel(totalMinutes) {
  const hours24 = Math.floor(totalMinutes / 60)
  const suffix = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 || 12
  return `${hours12}:00 ${suffix}`
}

function calculateDuration(startTime, endTime) {
  const startMinutes = toMinutes(startTime)
  const endMinutes = toMinutes(endTime)

  if (startMinutes === null || endMinutes === null) return 0
  if (startMinutes === endMinutes) return 0

  if (endMinutes > startMinutes) {
    return endMinutes - startMinutes
  }

  // Treat end earlier than start as overnight
  return 24 * 60 - startMinutes + endMinutes
}

function toSessionEvents(sessions) {
  return sessions
    .map((session) => {
      const createdAt = new Date(session.created_at)
      if (Number.isNaN(createdAt.getTime())) return null

      const duration = Number(session.duration_mins) || 45
      const endDate = new Date(createdAt.getTime() + duration * 60 * 1000)
      const title = Array.isArray(session.topics_covered) && session.topics_covered.length > 0
        ? session.topics_covered[0]
        : 'Study Session'

      return {
        id: `session-${session.id}`,
        title,
        subject: title,
        priority: 'normal',
        date: formatDateKey(createdAt),
        startTime: `${String(createdAt.getHours()).padStart(2, '0')}:${String(createdAt.getMinutes()).padStart(2, '0')}`,
        endTime: `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`,
        durationMins: duration,
        aiSuggested: true,
      }
    })
    .filter(Boolean)
}

function sortEvents(a, b) {
  if (a.date !== b.date) return a.date.localeCompare(b.date)
  return a.startTime.localeCompare(b.startTime)
}

function getTimelineLayout(event) {
  const startMinutes = toMinutes(event.startTime)
  if (startMinutes === null) return null

  const duration = Number(event.durationMins || calculateDuration(event.startTime, event.endTime) || 0)
  if (duration <= 0) return null

  const endMinutes = startMinutes + duration
  const visibleStart = Math.min(Math.max(startMinutes, TIMELINE_START_MINUTES), TIMELINE_END_MINUTES)
  const visibleEnd = Math.min(Math.max(endMinutes, TIMELINE_START_MINUTES), TIMELINE_END_MINUTES)
  const visibleDuration = visibleEnd - visibleStart
  if (visibleDuration <= 0) return null

  const topPx = getMinuteTopPx(visibleStart)
  const bottomPx = getMinuteTopPx(visibleEnd)
  const heightPx = Math.max(28, bottomPx - topPx - 2) // Ensure layout block has readable height

  return { topPx, heightPx }
}

function getTimeMarks() {
  const marks = []
  for (let minute = TIMELINE_START_MINUTES; minute <= TIMELINE_END_MINUTES; minute += TIMELINE_INTERVAL_MINUTES) {
    marks.push({
      minute,
      label: formatTimeLabel(minute),
    })
  }
  return marks
}

function getEventToneClass(event) {
  if (event.aiSuggested) {
    return 'bg-gradient-to-br from-[#FFFDF9] to-[#FFF7ED] border-[#FDBA74] text-[#C2410C] border-l-4 border-l-[#F97316] shadow-sm'
  }

  if (event.priority === 'high') {
    return 'bg-gradient-to-br from-[#FFFAFA] to-[#FEF2F2] border-[#FCA5A5] text-[#991B1B] border-l-4 border-l-[#EF4444] shadow-sm'
  }

  return 'bg-gradient-to-br from-[#FAFEFA] to-[#F0FDF4] border-[#A7F3D0] text-[#065F46] border-l-4 border-l-[#10B981] shadow-sm'
}

function isEventActiveAtMinutes(event, nowMinutes) {
  const start = toMinutes(event.startTime)
  if (start === null) return false

  const duration = event.durationMins || calculateDuration(event.startTime, event.endTime)
  if (duration <= 0) return false

  const end = start + duration
  if (end <= 24 * 60) {
    return nowMinutes >= start && nowMinutes <= end
  }

  return nowMinutes >= start || nowMinutes <= end - 24 * 60
}

export default function ScheduleView({ sessions, customEvents, onCreateEvent, onDeleteEvent }) {
  const [viewMode, setViewMode] = useState('weekly')
  const [showEventForm, setShowEventForm] = useState(false)
  const [eventError, setEventError] = useState('')
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    subject: '',
    priority: 'normal',
  })

  const now = new Date()
  const todayKey = formatDateKey(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const weekStart = getMonday(now)
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
  const boardDays = weekDays.slice(0, 5) // Mon-Fri for calendar grid
  const weekLabel = formatWeekRange(weekStart)
  const timeMarks = useMemo(() => getTimeMarks(), [])

  const sessionEvents = useMemo(() => toSessionEvents(sessions), [sessions])

  const preparedCustomEvents = useMemo(
    () => customEvents.map((event) => ({
      ...event,
      durationMins: calculateDuration(event.startTime, event.endTime),
      aiSuggested: false,
    })),
    [customEvents]
  )

  const allEvents = useMemo(
    () => [...sessionEvents, ...preparedCustomEvents].sort(sortEvents),
    [sessionEvents, preparedCustomEvents]
  )

  const eventsByDate = useMemo(() => {
    const map = new Map()
    allEvents.forEach((event) => {
      if (!map.has(event.date)) map.set(event.date, [])
      map.get(event.date).push(event)
    })
    return map
  }, [allEvents])

  const thisWeekKeys = weekDays.map(formatDateKey)

  const weekEvents = useMemo(
    () => allEvents.filter((event) => thisWeekKeys.includes(event.date)),
    [allEvents, thisWeekKeys]
  )

  const weekMinutes = weekEvents.reduce((sum, event) => sum + (event.durationMins || 0), 0)
  const focusScore = Math.min(100, Math.round((weekMinutes / 420) * 100))
  const weeklyBlockCount = weekEvents.length
  const highPriorityCount = weekEvents.filter((event) => event.priority === 'high').length

  const currentEventId = useMemo(() => {
    const todayEvents = weekEvents
      .filter((event) => event.date === todayKey)
      .sort(sortEvents)

    const activeEvent = todayEvents.find((event) => isEventActiveAtMinutes(event, nowMinutes))
    if (activeEvent) return activeEvent.id

    const nextEvent = todayEvents.find((event) => {
      const start = toMinutes(event.startTime)
      return start !== null && start >= nowMinutes
    })

    return nextEvent?.id || null
  }, [weekEvents, todayKey, nowMinutes])

  const upcomingDeadlines = preparedCustomEvents
    .filter((event) => event.date >= formatDateKey(now))
    .sort(sortEvents)
    .slice(0, 4)

  const monthAgenda = useMemo(() => {
    const grouped = new Map()
    allEvents.forEach((event) => {
      if (!grouped.has(event.date)) grouped.set(event.date, [])
      grouped.get(event.date).push(event)
    })

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, events]) => ({
        date,
        events: [...events].sort(sortEvents),
      }))
  }, [allEvents])

  const handleSubmitEvent = async (e) => {
    e.preventDefault()
    setEventError('')

    const title = eventForm.title.trim()
    const subject = eventForm.subject.trim()

    if (!title) {
      setEventError('Event title is required.')
      return
    }
    if (!eventForm.date) {
      setEventError('Pick a date for the event.')
      return
    }
    if (calculateDuration(eventForm.startTime, eventForm.endTime) <= 0) {
      setEventError('Start and end time cannot be the same.')
      return
    }

    try {
      await onCreateEvent({
        id: crypto.randomUUID(),
        title,
        subject: subject || 'General',
        date: eventForm.date,
        startTime: eventForm.startTime,
        endTime: eventForm.endTime,
        priority: eventForm.priority,
      })

      setEventForm({
        title: '',
        date: '',
        startTime: '09:00',
        endTime: '10:00',
        subject: '',
        priority: 'normal',
      })
      setShowEventForm(false)
    } catch (err) {
      setEventError(err.message || 'Could not create event right now.')
    }
  }

  const handleDeleteEvent = async (event) => {
    if (!event || event.aiSuggested || !onDeleteEvent) return

    try {
      setEventError('')
      await onDeleteEvent(event.id)
    } catch (err) {
      setEventError(err.message || 'Could not delete event right now.')
    }
  }

  return (
    <div className="h-full bg-[#FCFBF8] text-[#292524] overflow-hidden flex">
      <div className="h-full flex flex-col lg:flex-row w-full">
        {/* Sidebar planner stats - unified background */}
        <aside className="lg:w-[300px] border-b lg:border-b-0 lg:border-r border-[#E6E1DA] bg-[#FDFCFB] p-5 space-y-6 overflow-y-auto flex-shrink-0">
          <div>
            <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Weekly Goals</p>
            <div className="mt-3 bg-[#FCFBF8] rounded-xl border border-[#E6E1DA] p-4 space-y-4 shadow-sm">
              <div className="flex justify-center">
                <ProgressRing
                  value={focusScore}
                  size={100}
                  stroke={8}
                  trackClass="stroke-[#F6F4EF]"
                  progressClass="stroke-[#F97316]"
                  label=""
                />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-[#1C1917]" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                  {focusScore}% focus score
                </p>
                <p className="text-[10px] text-[#78716C] mt-0.5">Based on scheduled hours</p>
              </div>

              <div className="border-t border-[#E6E1DA]/60 pt-3 space-y-2 text-xs font-medium">
                <div className="flex items-center justify-between text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> Time Scheduled
                  </span>
                  <span className="font-bold text-[#1C1917]">{Math.round((weekMinutes / 60) * 10) / 10}h</span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FDBA74]" /> Study Blocks
                  </span>
                  <span className="font-bold text-[#1C1917]">{weeklyBlockCount}</span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> High-Priority
                  </span>
                  <span className="font-bold text-[#1C1917]">{highPriorityCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#E6E1DA] pt-5">
            <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Upcoming Deadlines</p>
            <div className="mt-3 space-y-2">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((event) => (
                  <div
                    key={event.id}
                    className={`rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                      event.priority === 'high'
                        ? 'bg-red-50/50 border-red-200 text-red-950 shadow-sm'
                        : 'bg-white border-[#E6E1DA] text-stone-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] text-[#78716C] font-semibold">
                          {formatAgendaDate(event.date)} • {event.startTime}
                        </p>
                        <p className="mt-1 text-xs font-bold leading-tight truncate">{event.title}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(event)}
                        className="rounded-md border border-red-150 bg-white text-red-500 hover:bg-red-600 hover:text-white p-1 transition-all active:scale-95 flex-shrink-0"
                        aria-label="Delete event"
                      >
                        <CloseIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-400 text-center py-4 italic">No upcoming deadlines</p>
              )}
            </div>
          </div>
        </aside>

        {/* Main Planner Panel */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col justify-between bg-[#FCFBF8]">
          <div className="space-y-6">
            {/* Header controls */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-[#1C1917] tracking-tight" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                  Mission Control
                </h2>
                <p className="text-xs text-[#78716C] mt-1 font-medium italic" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '15px' }}>
                  {weekLabel}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-[#E6E1DA] bg-white p-1 flex shadow-sm">
                  <button
                    type="button"
                    onClick={() => setViewMode('weekly')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewMode === 'weekly' ? 'bg-[#F97316] text-white shadow-sm' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('monthly')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewMode === 'monthly' ? 'bg-[#F97316] text-white shadow-sm' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Monthly Agenda
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowEventForm((prev) => !prev)
                    setEventError('')
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold shadow-sm hover:shadow active:scale-95 transition-all"
                >
                  <PlusIcon className="h-4 w-4" />
                  Schedule Event
                </button>
              </div>
            </div>

            {/* Event Input form */}
            {showEventForm && (
              <form onSubmit={handleSubmitEvent} className="rounded-2xl border border-[#E6E1DA] bg-white p-5 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#78716C] uppercase">Event Title</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Study Chemistry Chapter 4"
                    className="bg-[#FCFBF8] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs text-stone-850 placeholder-stone-450 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#78716C] uppercase">Subject / Tag</label>
                  <input
                    type="text"
                    value={eventForm.subject}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g. Chemistry"
                    className="bg-[#FCFBF8] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs text-stone-850 placeholder-stone-450 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#78716C] uppercase">Priority Rating</label>
                  <select
                    value={eventForm.priority}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, priority: e.target.value }))}
                    className="bg-[#FCFBF8] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs text-stone-850 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  >
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#78716C] uppercase">Event Date</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="bg-[#FCFBF8] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs text-stone-850 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#78716C] uppercase">Start Time</label>
                  <input
                    type="time"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, startTime: e.target.value }))}
                    className="bg-[#FCFBF8] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs text-stone-850 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#78716C] uppercase">End Time</label>
                  <input
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, endTime: e.target.value }))}
                    className="bg-[#FCFBF8] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs text-stone-850 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  />
                </div>

                <div className="md:col-span-3 flex items-center justify-between border-t border-[#E6E1DA]/60 pt-3">
                  <p className="text-[10px] text-stone-500 font-medium">
                    * Overnight crossing is supported if end time is before start time.
                  </p>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C] shadow-sm transition-all"
                  >
                    Save Event Block
                  </button>
                </div>
              </form>
            )}

            {eventError && (
              <p className="text-xs text-red-500 font-bold">{eventError}</p>
            )}

            {/* Calendar Main Grid Area */}
            {viewMode === 'weekly' ? (
              <section className="overflow-x-auto pr-1">
                <div className="min-w-[850px]">
                  {/* Single combined card container for perfect alignment */}
                  <div className="border border-[#E6E1DA] rounded-2xl bg-[#FCFBF8] overflow-hidden shadow-sm flex flex-col">
                    
                    {/* Header Row (Inner card top) */}
                    <div className="grid grid-cols-[64px_1fr_1fr_1fr_1fr_1fr] border-b border-[#E6E1DA]/60 bg-[#FDFCFB] py-3.5 flex-shrink-0">
                      <div /> {/* Spacer for Time axis */}
                      {boardDays.map((day) => {
                        const dayKey = formatDateKey(day)
                        const isToday = dayKey === todayKey

                        return (
                          <div key={dayKey} className="px-2 text-center">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-[#78716C] font-bold">
                              {formatDayName(day)}
                            </p>
                            <div className="mt-1 flex justify-center">
                              {isToday ? (
                                <span className="w-8 h-8 rounded-full bg-[#F97316] text-white flex items-center justify-center text-xs font-extrabold shadow-[0_2px_8px_rgba(249,115,22,0.3)]">
                                  {formatDayNumber(day)}
                                </span>
                              ) : (
                                <span className="w-8 h-8 flex items-center justify-center text-xs font-extrabold text-stone-700">
                                  {formatDayNumber(day)}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Timeline Canvas (Inner card body) */}
                    <div className="grid grid-cols-[64px_1fr_1fr_1fr_1fr_1fr] bg-white relative" style={{ height: `${TIMELINE_HEIGHT_PX}px` }}>
                      {/* Left vertical time ruler column */}
                      <div className="relative border-r border-[#E6E1DA]/80 bg-[#FDFCFB]">
                        {timeMarks.map((mark) => (
                          <div
                            key={mark.minute}
                            className="absolute right-3.5 -translate-y-1/2 text-[9px] text-stone-400 font-bold tracking-tight whitespace-nowrap"
                            style={{ top: `${getMinuteTopPx(mark.minute)}px` }}
                          >
                            {mark.label}
                          </div>
                        ))}
                      </div>

                      {/* Day Grid columns */}
                      {boardDays.map((day) => {
                        const key = formatDateKey(day)
                        const dayEvents = eventsByDate.get(key) || []

                        return (
                          <div key={key} className="relative border-r last:border-r-0 border-[#E6E1DA]/80 bg-white px-1.5 transition-colors duration-200 hover:bg-[#FDFCFB]/40">
                            {/* Grid row partition lines - vertically offset aligned */}
                            {timeMarks.map((mark) => (
                              <div
                                key={`${key}-${mark.minute}`}
                                className="absolute left-0 right-0 border-t border-[#F0ECE6]"
                                style={{ top: `${getMinuteTopPx(mark.minute)}px` }}
                              />
                            ))}

                            {/* Absolute Event blocks positioned mathematically */}
                            {dayEvents.map((event) => {
                              const layout = getTimelineLayout(event)
                              if (!layout) return null
                              const isCurrent = event.id === currentEventId

                              return (
                                <article
                                  key={event.id}
                                  className={`absolute left-1.5 right-1.5 rounded-xl border p-2.5 overflow-hidden flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-md ${getEventToneClass(event)}`}
                                  style={{
                                    top: `${layout.topPx}px`,
                                    height: `${layout.heightPx}px`,
                                  }}
                                >
                                  <div className="min-w-0">
                                    <div className="flex items-start justify-between gap-1.5">
                                      <p className="text-[9px] leading-tight font-extrabold opacity-75 whitespace-nowrap">
                                        {event.startTime} - {event.endTime}
                                      </p>

                                      {!event.aiSuggested && (
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteEvent(event)}
                                          className="text-[9px] rounded bg-white hover:bg-red-650 hover:text-white text-stone-600 p-0.5 border border-black/5 transition-all active:scale-95 flex-shrink-0"
                                          aria-label="Delete event"
                                        >
                                          <CloseIcon className="h-2.5 w-2.5" />
                                        </button>
                                      )}
                                    </div>

                                    <h4 className="mt-1 text-[11px] font-bold leading-snug text-[#1C1917] truncate" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                                      {event.title}
                                    </h4>
                                  </div>

                                  {/* Bottom visual indicators */}
                                  <div className="flex items-center justify-between gap-1 mt-1.5">
                                    {isCurrent && (
                                      <span className="text-[8px] font-extrabold tracking-wider text-orange-650 uppercase flex items-center gap-0.5">
                                        ● Current
                                      </span>
                                    )}
                                    {event.aiSuggested && (
                                      <span className="text-[8px] font-extrabold tracking-wider text-orange-700 uppercase">
                                        🤖 AI Suggestion
                                      </span>
                                    )}
                                  </div>
                                </article>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>

                  </div>
                </div>
              </section>
            ) : (
              /* Monthly Agenda List View */
              <section className="rounded-3xl border border-[#E6E1DA] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {monthAgenda.length > 0 ? (
                    monthAgenda.map((day) => (
                      <div key={day.date} className="rounded-2xl border border-[#E6E1DA] bg-[#FCFBF8] p-4 shadow-sm flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-[#E6E1DA]/60 pb-2">
                          <p className="text-sm font-bold text-[#1C1917]" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                            📅 {formatAgendaDate(day.date)}
                          </p>
                          <span className="text-xs font-semibold px-2 py-0.5 bg-[#E6E1DA]/60 rounded-full text-[#78716C]">
                            {day.events.length} event{day.events.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {day.events.map((event) => (
                            <div key={event.id} className="rounded-xl border border-[#E6E1DA] bg-white p-3.5 flex items-center justify-between gap-3 shadow-sm hover:border-[#FDBA74]/50 transition-all">
                              <div>
                                <p className="text-[10px] text-[#78716C] font-semibold">{event.startTime} - {event.endTime}</p>
                                <p className="text-sm text-[#1C1917] font-bold mt-1" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                                  {event.title}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-lg font-bold border ${
                                  event.aiSuggested
                                    ? 'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]'
                                    : event.priority === 'high'
                                    ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FEE2E2]'
                                    : 'bg-[#F0FDF4] text-[#15803D] border-[#DCFCE7]'
                                }`}>
                                  {event.aiSuggested ? 'AI' : event.priority}
                                </span>
                                {!event.aiSuggested && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteEvent(event)}
                                    className="text-[9px] rounded-lg bg-red-50 hover:bg-red-650 border border-red-150 hover:border-red-650 hover:text-white text-red-600 px-2 py-1.5 transition-all font-semibold active:scale-95"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <span className="text-3xl">📅</span>
                      <p className="text-sm text-stone-400 mt-2 font-medium">No events scheduled. Save study blocks using the planner form.</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
