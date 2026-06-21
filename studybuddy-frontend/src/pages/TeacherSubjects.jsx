import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  clearTeacherSession,
  getTeacherSession,
  setTeacherActiveSubject,
} from '../utils/teacherSession'

export default function TeacherSubjects() {
  const navigate = useNavigate()
  const [session, setSession] = useState(() => getTeacherSession())

  useEffect(() => {
    document.title = 'StudyBuddy — Teacher Portal'
  }, [])

  useEffect(() => {
    if (!session?.teacher_id) {
      navigate('/teacher/login', { replace: true })
      return
    }

    const subjects = Array.isArray(session.subjects) ? session.subjects : []
    if (subjects.length === 1 && subjects[0]?.id) {
      setTeacherActiveSubject(String(subjects[0].id))
      navigate('/teacher/home', { replace: true })
    }
  }, [session, navigate])

  const subjects = useMemo(() => {
    return Array.isArray(session?.subjects) ? session.subjects : []
  }, [session])

  const handleSelectSubject = (subjectId) => {
    setTeacherActiveSubject(String(subjectId))
    setSession(getTeacherSession())
    navigate('/teacher/home')
  }

  const handleLogout = () => {
    clearTeacherSession()
    setSession(null)
    navigate('/teacher/login')
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-[#FCFBF8] p-4 md:p-6 text-[#1C1917]">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="rounded-2xl border border-[#E6E1DA] bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#F97316] font-semibold">Teacher Portal</p>
              <h1 className="mt-1 text-2xl font-bold font-display text-[#1C1917]">Choose Your Subject</h1>
              <p className="text-sm text-[#78716C] mt-1">Select a subject workspace to continue.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-lg border border-[#E6E1DA] bg-white px-3 py-2 text-xs font-medium text-[#44403C] hover:border-[#F97316] hover:text-[#F97316] transition-all"
              >
                Portal Selection
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-medium text-white hover:bg-orange-500 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-[#E6E1DA] bg-white p-4 shadow-sm">
          {subjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#E6E1DA] bg-[#FCFBF8] p-8 text-center">
              <p className="text-sm text-[#44403C]">No subjects are assigned to this teacher yet.</p>
              <p className="text-xs text-[#78716C] mt-1">Contact your organization admin to create or assign a subject.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {subjects.map((subject) => (
                <button
                   key={subject.id}
                   type="button"
                   onClick={() => handleSelectSubject(subject.id)}
                   className="rounded-xl border border-[#E6E1DA] bg-[#FCFBF8] p-4 text-left transition-all hover:border-[#F97316] hover:bg-white shadow-sm hover:shadow-md"
                >
                  <p className="text-base font-semibold text-[#1C1917]">{subject.name || 'Subject'}</p>
                  <p className="mt-1 text-xs font-semibold text-[#F97316]">{subject.subject_code || 'N/A'}</p>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
