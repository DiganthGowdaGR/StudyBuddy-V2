import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

function normalizeEnrollmentRow(row) {
  const subject = row?.subject || {}
  const teacher = row?.teacher || {}
  const organization = row?.organization || {}

  return {
    enrollmentId: String(row?.enrollment_id || row?.id || ''),
    status: String(row?.status || 'pending').toLowerCase(),
    requestedAt: row?.requested_at || '',
    subjectId: String(subject?.id || ''),
    subjectName: String(subject?.name || 'Subject'),
    subjectCode: String(subject?.subject_code || ''),
    teacherName: String(teacher?.full_name || 'Unassigned'),
    orgName: String(organization?.name || ''),
  }
}

function statusBadge(status) {
  if (status === 'approved')
    return <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Approved</span>
  if (status === 'rejected')
    return <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">Rejected</span>
  return <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Pending</span>
}

export default function OrganizationsView({ studentName }) {
  const navigate = useNavigate()
  const studentId = localStorage.getItem('student_id')

  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [subjectCode, setSubjectCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')

  const loadSubjects = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    try {
      const res = await api.getStudentSubjects(studentId)
      const rows = Array.isArray(res?.subjects) ? res.subjects : []
      setSubjects(rows.map(normalizeEnrollmentRow).filter((r) => r.subjectId))
    } catch {
      setSubjects([])
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => { loadSubjects() }, [loadSubjects])

  const handleJoin = async (e) => {
    e.preventDefault()
    if (!subjectCode.trim()) { setError('Subject code is required.'); return }
    if (!studentId) return

    setJoining(true)
    setError('')
    setFeedback('')
    try {
      const res = await api.joinSubject(subjectCode.trim().toUpperCase(), studentId)
      const name = res?.subject?.name || 'Class'
      setFeedback(`Request sent for ${name}.`)
      setSubjectCode('')
      await loadSubjects()
    } catch (err) {
      setError(err.message || 'Failed to join class.')
    } finally {
      setJoining(false)
    }
  }

  const approvedCount = useMemo(() => subjects.filter((r) => r.status === 'approved').length, [subjects])

  return (
    <div className="h-full overflow-y-auto bg-[#FCFBF8] p-6 pb-24 text-stone-700">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="border border-[#E6E1DA] bg-white rounded-2xl p-6 shadow-sm flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">MY CLASSES</span>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 font-clash">Welcome, {studentName || 'Student'}</h2>
            <p className="text-sm text-stone-500">Join with subject codes and access enrolled classes.</p>
          </div>
          <button
            type="button"
            onClick={loadSubjects}
            className="border border-[#E6E1DA] bg-[#FCFBF8] hover:bg-[#F6F4EF] text-stone-700 font-semibold px-4 py-2 rounded-xl transition-all shadow-sm text-sm"
          >
            Refresh
          </button>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <section className="border border-[#E6E1DA] bg-white rounded-2xl p-5 shadow-sm space-y-4 xl:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-400 font-bold">Join a Class</p>
                <p className="text-xs text-stone-500 mt-1">Use the subject code from your teacher.</p>
              </div>
              <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-600">{approvedCount} approved</span>
            </div>

            <form onSubmit={handleJoin} className="space-y-3">
              <input
                type="text"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                placeholder="e.g. MATH-2048"
                style={{ textTransform: 'uppercase' }}
                className="w-full border border-[#E6E1DA] bg-white text-stone-800 placeholder-stone-400 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono tracking-[0.15em]"
              />

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
              {feedback && <p className="text-xs text-emerald-600 font-medium">{feedback}</p>}

              <button
                type="submit"
                disabled={joining}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl shadow-sm transition-colors text-sm disabled:opacity-60"
              >
                {joining ? 'Requesting…' : 'Request to Join'}
              </button>
            </form>

            <div className="grid grid-cols-2 gap-3">
              <div className="border border-[#E6E1DA] bg-[#FCFBF8] p-3 rounded-xl shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400 font-bold">Approved</p>
                <p className="mt-2 text-2xl font-bold text-stone-800">{approvedCount}</p>
              </div>
              <div className="border border-[#E6E1DA] bg-[#FCFBF8] p-3 rounded-xl shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400 font-bold">Total</p>
                <p className="mt-2 text-2xl font-bold text-stone-800">{subjects.length}</p>
              </div>
            </div>
          </section>

          <section className="border border-[#E6E1DA] bg-white rounded-2xl p-5 shadow-sm xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-400 font-bold">Enrolled Classes</p>
                <p className="text-xs text-stone-500 mt-1">Review status and jump into class spaces.</p>
              </div>
              <p className="text-xs text-stone-500 font-medium">{approvedCount} approved</p>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                </div>
              ) : subjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#E6E1DA] bg-[#FCFBF8] px-5 py-10 text-center">
                  <p className="text-4xl" aria-hidden="true">🏫</p>
                  <p className="mt-3 text-lg font-semibold text-stone-800 font-clash">No classes yet</p>
                  <p className="text-sm text-stone-500 mt-2">Enter a subject code from your teacher to join your first class</p>
                  <p className="text-sm text-stone-400 mt-1 italic">→ Use the Join a Class panel on the left</p>
                </div>
              ) : (
                subjects.map((item) => (
                  <article
                    key={item.enrollmentId || item.subjectId}
                    className="rounded-xl border border-[#E6E1DA] bg-[#FCFBF8] p-4 transition-all hover:border-orange-500 hover:-translate-y-0.5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-base font-semibold text-stone-800 font-clash">{item.subjectName}</h4>
                        <p className="text-xs text-orange-600 font-bold mt-0.5">{item.subjectCode}</p>
                        <div className="mt-2 space-y-0.5 text-xs text-stone-500 font-medium">
                          <p>Teacher: {item.teacherName}</p>
                          {item.orgName && <p>Organization: {item.orgName}</p>}
                        </div>
                      </div>
                      {statusBadge(item.status)}
                    </div>

                    {item.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => navigate(`/app/organizations/${item.subjectId}`)}
                        className="mt-4 border border-[#E6E1DA] bg-white hover:bg-orange-500 hover:text-white hover:border-orange-500 text-stone-700 font-semibold px-3 py-2 rounded-xl transition-all shadow-sm text-xs"
                      >
                        Open Class
                      </button>
                    )}
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
