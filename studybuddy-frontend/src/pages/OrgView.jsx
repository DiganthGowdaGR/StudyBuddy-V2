import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'
import { clearOrganizationSession, getOrganizationSession } from '../utils/organizationSession'

const MEDAL_COLORS = ['text-yellow-400', 'text-gray-300', 'text-amber-600']

function relationFirst(value) {
  if (Array.isArray(value)) return value[0] || null
  if (value && typeof value === 'object') return value
  return null
}

function normalizeSubjectRow(row) {
  const subject = row?.subject || {}
  const teacher = row?.teacher || {}
  const organization = row?.organization || {}

  return {
    enrollmentId: String(row?.enrollment_id || row?.id || ''),
    status: String(row?.status || 'pending').toLowerCase(),
    requestedAt: row?.requested_at || '',
    subject: {
      id: String(subject?.id || ''),
      name: String(subject?.name || 'Subject'),
      subject_code: String(subject?.subject_code || ''),
    },
    teacher: {
      id: String(teacher?.id || ''),
      full_name: String(teacher?.full_name || 'Unknown'),
      email: String(teacher?.email || ''),
    },
    organization: {
      id: String(organization?.id || ''),
      name: String(organization?.name || 'Organization'),
    },
  }
}

function teacherNameFromSubject(subject) {
  const teacher = relationFirst(subject?.teachers) || {}
  return teacher.full_name || 'Unknown'
}

function getTagClasses(tag) {
  const normalized = String(tag || 'General').toLowerCase()
  if (normalized === 'assignment') return 'bg-blue-900/40 text-blue-300'
  if (normalized === 'important') return 'bg-rose-900/40 text-rose-300'
  return 'bg-gray-700 text-gray-200'
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function OrgView() {
  const navigate = useNavigate()
  const { subjectId } = useParams()

  const studentId = localStorage.getItem('student_id')
  const studentName = localStorage.getItem('student_name') || 'Student'

  const [subjectRow, setSubjectRow] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [exams, setExams] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loadingContext, setLoadingContext] = useState(true)
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false)
  const [loadingExams, setLoadingExams] = useState(false)
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)
  const [activeTab, setActiveTab] = useState('announcements')
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'StudyBuddy — My Classes'
  }, [])

  const loadContext = useCallback(async () => {
    if (!studentId || !subjectId) return

    setLoadingContext(true)
    setError('')
    try {
      const res = await api.getStudentSubjects(studentId)
      const rows = Array.isArray(res?.subjects) ? res.subjects : []
      const current = rows.find((row) => String(row?.subject?.id || '') === String(subjectId))

      if (!current) {
        setSubjectRow(null)
        setError('Class not found in your enrollments.')
        return
      }

      setSubjectRow(normalizeSubjectRow(current))
    } catch (err) {
      setError(err.message || 'Failed to load class details.')
      setSubjectRow(null)
    } finally {
      setLoadingContext(false)
    }
  }, [studentId, subjectId])

  const loadAnnouncements = useCallback(async (currentSubjectId) => {
    if (!currentSubjectId) {
      setAnnouncements([])
      return
    }

    setLoadingAnnouncements(true)
    try {
      const res = await api.getAnnouncements(currentSubjectId)
      setAnnouncements(Array.isArray(res?.announcements) ? res.announcements : [])
    } catch {
      setAnnouncements([])
    } finally {
      setLoadingAnnouncements(false)
    }
  }, [])

  const loadExams = useCallback(async (currentSubjectId) => {
    if (!currentSubjectId) {
      setExams([])
      return
    }

    setLoadingExams(true)
    try {
      const res = await api.getAvailableExams(studentId)
      const all = Array.isArray(res?.available)
        ? res.available
        : (Array.isArray(res?.exams) ? res.exams : [])
      setExams(all.filter((e) => String(e.subject_id) === String(currentSubjectId)))
    } catch {
      setExams([])
    } finally {
      setLoadingExams(false)
    }
  }, [studentId])

  const loadLeaderboard = useCallback(async (currentSubjectId) => {
    if (!currentSubjectId) {
      setLeaderboard([])
      return
    }

    setLoadingLeaderboard(true)
    try {
      const res = await api.getSubjectLeaderboard(currentSubjectId)
      setLeaderboard(Array.isArray(res?.leaderboard) ? res.leaderboard : [])
    } catch {
      setLeaderboard([])
    } finally {
      setLoadingLeaderboard(false)
    }
  }, [])

  useEffect(() => {
    if (!studentId) {
      navigate('/', { replace: true })
      return
    }

    loadContext()
  }, [studentId, navigate, loadContext])

  useEffect(() => {
    const currentSubjectId = subjectRow?.subject?.id
    const isApproved = subjectRow?.status === 'approved'

    if (!currentSubjectId || !isApproved) {
      setAnnouncements([])
      setExams([])
      setLeaderboard([])
      return
    }

    loadAnnouncements(currentSubjectId)
    loadExams(currentSubjectId)
    loadLeaderboard(currentSubjectId)
  }, [subjectRow, loadAnnouncements, loadExams, loadLeaderboard])

  if (loadingContext) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] text-stone-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    )
  }

  if (!subjectRow) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] text-stone-800 p-6">
        <div className="mx-auto max-w-3xl border border-[#E6E1DA] bg-white rounded-2xl p-6 shadow-sm text-center">
          <p className="text-sm text-stone-500">{error || 'Class not found.'}</p>
          <button
            type="button"
            onClick={() => navigate('/app/organizations')}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-xl shadow-sm text-xs transition-colors"
          >
            Back to Classes
          </button>
        </div>
      </div>
    )
  }

  const isApproved = subjectRow.status === 'approved'

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-stone-800">
      <header className="sticky top-0 z-20 h-14 bg-[#F6F4EF] border-b border-[#E6E1DA] px-4 md:px-6 shadow-sm">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/app/organizations')}
            className="border border-[#E6E1DA] bg-white hover:bg-[#F6F4EF] text-stone-700 font-semibold px-3 py-2 rounded-xl transition-all shadow-sm text-xs"
          >
            Back to Classes
          </button>

          <p className="text-sm font-semibold text-stone-800 truncate px-2 font-clash">{subjectRow.organization.name}</p>

          <div className="rounded-full bg-white border border-[#E6E1DA] px-3 py-1 text-sm text-stone-700 font-semibold shadow-sm">
            {studentName}
          </div>
        </div>
      </header>

      <section className="border-b border-[#E6E1DA] bg-[#F6F4EF] p-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-stone-850 font-clash">{subjectRow.subject.name}</h2>
              <p className="text-sm text-orange-600 font-bold mt-0.5">{subjectRow.subject.subject_code}</p>
              <p className="text-xs text-stone-500 mt-1 font-medium">Teacher: {subjectRow.teacher.full_name}</p>
            </div>
            <div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                subjectRow.status === 'approved'
                  ? 'bg-emerald-50 border-emerald-250 text-emerald-700'
                  : subjectRow.status === 'rejected'
                  ? 'bg-red-50 border-red-250 text-red-700'
                  : 'bg-amber-50 border-amber-250 text-amber-700'
              }`}>
                {subjectRow.status}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1 bg-[#E6E1DA]/30 p-1 rounded-xl border border-[#E6E1DA]/40 w-fit relative">
            {['announcements', 'exams', 'leaderboard'].map((tab) => {
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors duration-200 relative ${
                    isActive ? 'text-orange-600' : 'text-stone-500 hover:text-stone-850'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="org-view-active-pill"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm border border-[#E6E1DA]/50"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      style={{ originY: '0px' }}
                    />
                  )}
                  <span className="relative z-10">
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl p-4 md:p-6">
        {!isApproved ? (
          <div className="border border-[#E6E1DA] bg-white rounded-2xl p-6 shadow-sm text-center">
            <p className="text-sm text-stone-500 font-medium">
              Access to class content is available after your enrollment request is approved.
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'announcements' && (
              <div>
                {loadingAnnouncements ? (
                  <div className="py-8 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-4xl" aria-hidden="true">📢</p>
                    <p className="mt-3 text-lg font-semibold text-stone-800 font-clash">All quiet here</p>
                    <p className="mt-2 text-sm text-stone-500">Your teacher hasn&apos;t posted anything yet. Check back soon.</p>
                  </div>
                ) : (
                  announcements.map((item) => {
                    const tag = String(item.tag || 'General')
                    return (
                      <article key={item.id} className="mb-3 border border-[#E6E1DA] bg-white p-5 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`rounded-full border border-orange-200 bg-[#FFF7ED] text-orange-600 px-2 py-0.5 text-xs font-semibold`}>{tag}</span>
                          <span className="text-xs text-stone-400 font-medium">{timeAgo(item.created_at || new Date().toISOString())}</span>
                        </div>
                        <h3 className="mt-2 text-base font-semibold text-stone-800 font-clash">{item.title || 'Announcement'}</h3>
                        <p className="mt-1 text-sm text-stone-600">{item.body || ''}</p>
                        <p className="mt-3 text-xs text-stone-400 font-medium">Posted by {item.teacher_name || subjectRow.teacher.full_name}</p>
                      </article>
                    )
                  })
                )}
              </div>
            )}

            {activeTab === 'exams' && (
              <div>
                {loadingExams ? (
                  <div className="py-8 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                  </div>
                ) : exams.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-4xl" aria-hidden="true">📋</p>
                    <p className="mt-3 text-lg font-semibold text-stone-800 font-clash">No exams scheduled</p>
                    <p className="mt-2 text-sm text-stone-500">When your teacher publishes an exam it will appear here.</p>
                  </div>
                ) : (
                  exams.map((ex) => (
                    <article key={ex.id} className="mb-3 border border-[#E6E1DA] bg-white p-5 rounded-2xl shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-stone-800 font-clash">{ex.title}</h3>
                          <p className="mt-1 text-sm text-stone-600">{ex.description || ''}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-stone-500 font-semibold">
                            <span>Type: {ex.exam_type?.toUpperCase()}</span>
                            <span>Duration: {ex.duration_mins} mins</span>
                            <span>Total: {ex.total_marks} marks</span>
                          </div>
                        </div>
                        <span className="rounded-full bg-emerald-50 border border-emerald-250 text-emerald-700 px-2 py-0.5 text-xs font-semibold">Active</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => navigate(`/app/exam/${ex.id}/${ex.exam_type}`)}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-xl shadow-sm text-xs transition-colors"
                        >
                          Start Exam
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div>
                {loadingLeaderboard ? (
                  <div className="py-8 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                  </div>
                ) : leaderboard.length === 0 ? (
                  <p className="py-8 text-center text-stone-500 italic">No leaderboard data yet. Complete an exam to see rankings!</p>
                ) : (
                  <>
                    <div className="flex items-end justify-center gap-4 mb-6 pt-4">
                      {[1, 0, 2].map((idx) => {
                        const entry = leaderboard[idx]
                        if (!entry) return <div key={idx} className="w-28" />
                        const height = idx === 0 ? 'h-28' : idx === 1 ? 'h-20' : 'h-16'
                        return (
                          <div key={idx} className="flex flex-col items-center">
                            <p className={`text-lg font-bold ${MEDAL_COLORS[idx]}`}>#{entry.rank}</p>
                            <p className="text-sm text-stone-800 font-bold mt-1 truncate max-w-[7rem] font-clash">{entry.student_name}</p>
                            <p className="text-xs text-stone-500 font-medium">{entry.total_score}</p>
                            <div className={`${height} w-20 mt-2 rounded-t-lg ${idx === 0 ? 'bg-yellow-500/10 border-t border-yellow-250' : idx === 1 ? 'bg-stone-400/10 border-t border-stone-250' : 'bg-amber-700/10 border-t border-amber-250'}`} />
                          </div>
                        )
                      })}
                    </div>

                    <div className="rounded-xl border border-[#E6E1DA] bg-white overflow-hidden shadow-sm">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#E6E1DA] bg-[#FCFBF8]">
                            <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase">Rank</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase">Student</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase">Score</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase">Exams</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboard.map((e) => (
                            <tr key={e.student_id || e.rank} className="border-b border-[#E6E1DA]/50 hover:bg-[#F6F4EF]/50">
                              <td className="px-4 py-3 text-sm text-stone-800 font-semibold">#{e.rank}</td>
                              <td className="px-4 py-3 text-sm text-stone-800 font-semibold">{e.student_name}</td>
                              <td className="px-4 py-3 text-sm text-stone-800 font-semibold">{e.total_score}</td>
                              <td className="px-4 py-3 text-sm text-stone-500 font-medium">{e.exams_attempted || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function OrganizationAdminView() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [sessionChecked, setSessionChecked] = useState(false)

  const [org, setOrg] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [pendingMembers, setPendingMembers] = useState([])

  const [teacherName, setTeacherName] = useState('')
  const [teacherEmail, setTeacherEmail] = useState('')
  const [teacherPassword, setTeacherPassword] = useState('')
  const [subjectName, setSubjectName] = useState('')

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [activeMemberAction, setActiveMemberAction] = useState('')
  const [creatingTeacher, setCreatingTeacher] = useState(false)
  const [teacherToDelete, setTeacherToDelete] = useState(null)
  const [deletingTeacherId, setDeletingTeacherId] = useState('')

  useEffect(() => {
    document.title = 'StudyBuddy — Organization'
  }, [])

  const orgId = session?.org_id

  useEffect(() => {
    const storedSession = getOrganizationSession()

    if (storedSession?.org_id) {
      setSession(storedSession)
      setSessionChecked(true)
      return
    }

    const fallbackOrgId = localStorage.getItem('org_id') || localStorage.getItem('organizer_id')
    const fallbackOrgName = localStorage.getItem('org_name')

    if (fallbackOrgId || fallbackOrgName) {
      setSession({
        org_id: fallbackOrgId || null,
        name: fallbackOrgName || '',
      })
    } else {
      setSession(null)
    }

    setSessionChecked(true)
  }, [])

  const loadDashboard = useCallback(async ({ silent = false } = {}) => {
    if (!orgId) return

    if (silent) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError('')

    try {
      const [orgRes, subjectsRes, pendingRes] = await Promise.all([
        api.getOrgById(orgId),
        api.getOrgSubjects(orgId),
        api.getOrgPending(orgId),
      ])

      setOrg(orgRes || null)
      setSubjects(Array.isArray(subjectsRes?.subjects) ? subjectsRes.subjects : [])
      setPendingMembers(Array.isArray(pendingRes?.members) ? pendingRes.members : [])
    } catch (err) {
      setError(err.message || 'Could not load organization dashboard.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [orgId])

  useEffect(() => {
    if (!sessionChecked) return
    if (!session?.org_id) {
      navigate('/organization/login', { replace: true })
      return
    }

    loadDashboard()
  }, [sessionChecked, session?.org_id, loadDashboard, navigate])

  const pendingBySubject = useMemo(() => {
    const groups = {}

    pendingMembers.forEach((member) => {
      const subject = member?.subject || {}
      const subjectKey = String(subject?.id || 'unknown')
      if (!groups[subjectKey]) {
        groups[subjectKey] = {
          key: subjectKey,
          subject,
          members: [],
        }
      }
      groups[subjectKey].members.push(member)
    })

    return Object.values(groups)
  }, [pendingMembers])

  const teachers = useMemo(() => {
    const map = {}

    subjects.forEach((subject) => {
      const teacherId = String(subject?.teacher_id || '')
      if (!teacherId) return

      const teacherInfo = relationFirst(subject?.teachers) || {}
      if (!map[teacherId]) {
        map[teacherId] = {
          id: teacherId,
          full_name: teacherInfo?.full_name || 'Unknown',
          email: teacherInfo?.email || '',
          subjectCount: 0,
        }
      }

      map[teacherId].subjectCount += 1
    })

    return Object.values(map)
  }, [subjects])

  const handleMemberStatus = async (enrollmentId, status) => {
    if (!enrollmentId) return

    const actionKey = `${enrollmentId}:${status}`
    setActiveMemberAction(actionKey)
    setError('')
    setFeedback('')

    try {
      await api.updateSubjectEnrollmentStatus(enrollmentId, status)
      await loadDashboard({ silent: true })
      setFeedback(`Enrollment ${status} successfully.`)
    } catch (err) {
      setError(err.message || 'Could not update enrollment status.')
    } finally {
      setActiveMemberAction('')
    }
  }

  const handleCreateTeacher = async (e) => {
    e.preventDefault()

    if (!teacherName.trim() || !teacherEmail.trim() || !teacherPassword || !subjectName.trim()) {
      setError('Teacher name, email, password, and subject are required.')
      return
    }

    setCreatingTeacher(true)
    setError('')
    setFeedback('')

    try {
      const res = await api.registerTeacher({
        org_id: orgId,
        email: teacherEmail.trim().toLowerCase(),
        full_name: teacherName.trim(),
        password: teacherPassword,
        subject_name: subjectName.trim(),
      })

      setTeacherName('')
      setTeacherEmail('')
      setTeacherPassword('')
      setSubjectName('')

      if (res?.teacher_already_exists) {
        setFeedback('Subject added to existing teacher account.')
      } else {
        setFeedback('Teacher created. Share the email and password with that teacher.')
      }

      await loadDashboard({ silent: true })
    } catch (err) {
      setError(err.message || 'Could not create teacher.')
    } finally {
      setCreatingTeacher(false)
    }
  }

  const handleConfirmDeleteTeacher = async () => {
    if (!teacherToDelete?.id || !orgId) return

    setDeletingTeacherId(teacherToDelete.id)
    setError('')
    setFeedback('')

    try {
      await api.deleteTeacher(orgId, teacherToDelete.id)
      setTeacherToDelete(null)
      setFeedback('Teacher and related subjects deleted successfully.')
      await loadDashboard({ silent: true })
    } catch (err) {
      setError(err.message || 'Could not delete teacher.')
    } finally {
      setDeletingTeacherId('')
    }
  }

  const handleLogout = () => {
    clearOrganizationSession()
    setSession(null)
    navigate('/organization/login')
  }

  const organizationName = useMemo(() => {
    return org?.name || session?.name || 'Organization'
  }, [org, session])

  if (!sessionChecked) {
    return <div style={{ minHeight: '100vh', background: '#FCFBF8' }} />
  }

  if (!session) {
    return <div style={{ minHeight: '100vh', background: '#FCFBF8' }} />
  }

  return (
    <div className="min-h-screen bg-[#FCFBF8] p-4 md:p-6 text-stone-850">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-2xl border border-[#E6E1DA] bg-[#F6F4EF] px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-orange-600 font-bold">Organization Workspace</p>
              <h1 className="mt-1 text-2xl font-semibold text-stone-900 font-clash">{organizationName}</h1>
              <p className="text-sm text-stone-500 mt-1 font-medium">Review class join requests and manage teachers.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadDashboard({ silent: true })}
                disabled={refreshing}
                className="rounded-lg border border-[#E6E1DA] bg-white px-3 py-2 text-xs text-stone-700 font-semibold hover:bg-[#F6F4EF] disabled:opacity-60 transition-colors shadow-sm"
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-lg border border-[#E6E1DA] bg-white px-3 py-2 text-xs text-stone-700 font-semibold hover:bg-[#F6F4EF] transition-colors shadow-sm"
              >
                Portal Selection
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-red-500 hover:bg-red-600 px-3 py-2 text-xs text-white font-semibold shadow-sm transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-750 font-semibold">
            {error}
          </div>
        )}

        {feedback && (
          <div className="rounded-lg border border-emerald-250 bg-emerald-50 px-3 py-2 text-sm text-emerald-750 font-semibold">
            {feedback}
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-3">
          <section className="rounded-2xl border border-[#E6E1DA] bg-white p-4 xl:col-span-2 shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-[#E6E1DA] pb-2 mb-3">
              <h2 className="text-base font-bold text-stone-850 font-clash">Pending Join Requests</h2>
              <p className="text-xs text-stone-500 font-bold">
                {pendingMembers.length} pending
              </p>
            </div>

            <div className="mt-3 space-y-3">
              {!loading && pendingBySubject.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#E6E1DA] bg-[#FCFBF8] p-6 text-center">
                  <p className="text-sm text-stone-600 font-medium">No pending requests right now.</p>
                  <p className="text-xs text-stone-400 mt-1">New class join requests will appear here.</p>
                </div>
              )}

              {pendingBySubject.map((group) => {
                const subject = group.subject || {}
                return (
                  <article key={group.key} className="rounded-xl border border-[#E6E1DA] bg-[#FCFBF8] p-3 shadow-sm">
                    <div className="mb-2 flex items-center justify-between gap-2 border-b border-[#E6E1DA]/40 pb-1">
                      <div>
                        <p className="text-sm font-semibold text-stone-800 font-clash">{subject.name || 'Subject'}</p>
                        <p className="text-[11px] text-orange-600 font-bold">{subject.subject_code || 'N/A'}</p>
                      </div>
                      <p className="text-[11px] text-stone-500 font-medium">{group.members.length} pending</p>
                    </div>

                    <div className="space-y-2">
                      {group.members.map((member) => {
                        const enrollmentId = member?.enrollment_id
                        const approveKey = `${enrollmentId}:approved`
                        const rejectKey = `${enrollmentId}:rejected`

                        return (
                          <div key={enrollmentId} className="rounded-lg border border-[#E6E1DA] bg-white p-3 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-bold text-stone-800">{member?.student?.name || 'Student'}</p>
                                <p className="text-xs text-stone-500">{member?.student?.email || 'N/A'}</p>
                                <p className="text-[11px] text-stone-400 mt-1 font-medium">Requested: {member?.requested_at || 'N/A'}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleMemberStatus(enrollmentId, 'approved')}
                                  disabled={activeMemberAction === approveKey || activeMemberAction === rejectKey}
                                  className="rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3 py-1.5 text-xs shadow-sm transition-colors"
                                >
                                  {activeMemberAction === approveKey ? 'Approving...' : 'Approve'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMemberStatus(enrollmentId, 'rejected')}
                                  disabled={activeMemberAction === approveKey || activeMemberAction === rejectKey}
                                  className="rounded-lg border border-red-150 bg-red-50 text-red-650 hover:bg-red-500 hover:text-white px-3 py-1.5 text-xs font-semibold transition-all"
                                >
                                  {activeMemberAction === rejectKey ? 'Rejecting...' : 'Reject'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <section className="space-y-4 xl:col-span-1">
            <article className="rounded-2xl border border-[#E6E1DA] bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold text-stone-800 font-clash">Organization Summary</h2>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Organization</span>
                  <span className="text-stone-800 font-semibold">{organizationName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Admin Email</span>
                  <span className="text-stone-800 font-semibold">{session?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Invite Code</span>
                  <span className="rounded-md border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-600">
                    {org?.invite_code || session?.invite_code || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-[#E6E1DA] bg-[#FCFBF8] px-3 py-2 text-center shadow-sm">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Pending</p>
                  <p className="mt-1 text-lg font-bold text-stone-800">{pendingMembers.length}</p>
                </div>
                <div className="rounded-lg border border-[#E6E1DA] bg-[#FCFBF8] px-3 py-2 text-center shadow-sm">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Subjects</p>
                  <p className="mt-1 text-lg font-bold text-stone-800">{subjects.length}</p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-[#E6E1DA] bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold text-stone-800 font-clash">Create Teacher</h2>
              <p className="mt-1 text-xs text-stone-500">Create a teacher account with an initial subject.</p>

              <form onSubmit={handleCreateTeacher} className="mt-3 space-y-2.5">
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Teacher full name"
                  className="w-full rounded-xl border border-[#E6E1DA] bg-[#FCFBF8] px-2.5 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                />
                <input
                  type="email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="Teacher email"
                  className="w-full rounded-xl border border-[#E6E1DA] bg-[#FCFBF8] px-2.5 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                />
                <input
                  type="password"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  placeholder="Teacher password"
                  className="w-full rounded-xl border border-[#E6E1DA] bg-[#FCFBF8] px-2.5 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                />
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Subject name"
                  className="w-full rounded-xl border border-[#E6E1DA] bg-[#FCFBF8] px-2.5 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                />

                <button
                  type="submit"
                  disabled={creatingTeacher}
                  className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-3 text-xs shadow-sm transition-colors disabled:opacity-60"
                >
                  {creatingTeacher ? 'Creating...' : 'Create Teacher Account'}
                </button>
              </form>
            </article>

            <article className="rounded-2xl border border-[#E6E1DA] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2 border-b border-[#E6E1DA] pb-1.5 mb-2">
                <h2 className="text-sm font-bold text-stone-800 font-clash">Teachers</h2>
                <p className="text-[11px] text-stone-400 font-bold">{teachers.length} total</p>
              </div>

              <div className="mt-3 space-y-2">
                {teachers.length > 0 ? (
                  teachers.map((teacher) => (
                    <div key={teacher.id} className="rounded-lg border border-[#E6E1DA] bg-[#FCFBF8] p-2.5 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-stone-800">{teacher.full_name}</p>
                          <p className="text-[11px] text-stone-500 mt-0.5 font-medium">{teacher.email || 'N/A'}</p>
                          <p className="text-[11px] text-stone-400 mt-1 font-semibold">Subjects: {teacher.subjectCount}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTeacherToDelete(teacher)}
                          className="rounded-lg border border-red-150 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-650 hover:bg-red-500 hover:text-white transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 italic">No teachers available yet.</p>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-[#E6E1DA] bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold text-stone-850 font-clash border-b border-[#E6E1DA] pb-1.5 mb-2">Subjects</h2>
              <div className="mt-3 space-y-2">
                {subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <div key={subject.id} className="rounded-lg border border-[#E6E1DA] bg-[#FCFBF8] p-2.5 shadow-sm">
                      <p className="text-sm font-semibold text-stone-800">{subject.name}</p>
                      <p className="text-[11px] text-orange-600 font-bold mt-0.5">{subject.subject_code}</p>
                      <p className="text-[11px] text-stone-500 mt-1 font-semibold">Teacher: {teacherNameFromSubject(subject)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 italic">No subjects available yet.</p>
                )}
              </div>
            </article>
          </section>
        </div>
      </div>

      {teacherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E6E1DA] bg-white p-6 shadow-xl animate-fade-in">
            <h3 className="text-lg font-bold text-stone-900 font-clash">Delete Teacher</h3>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              Delete <span className="font-bold text-stone-850">{teacherToDelete.full_name}</span> and all subjects assigned to this teacher?
            </p>
            <p className="mt-1 text-xs text-stone-450 italic">
              This also removes announcements, assignments, and enrollments for those deleted subjects.
            </p>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                className="rounded-lg border border-[#E6E1DA] bg-white text-stone-750 px-3 py-2 text-xs font-semibold hover:bg-[#F6F4EF] shadow-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTeacher}
                disabled={deletingTeacherId === teacherToDelete.id}
                className="rounded-lg bg-red-500 hover:bg-red-650 px-3 py-2 text-xs text-white font-semibold shadow-sm transition-colors disabled:opacity-60"
              >
                {deletingTeacherId === teacherToDelete.id ? 'Deleting...' : 'Delete Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
