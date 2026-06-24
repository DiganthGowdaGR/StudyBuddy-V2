import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { setTeacherSession } from '../utils/teacherSession'
import { setOrganizationSession } from '../utils/organizationSession'

function StudentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-[#F97316]" aria-hidden="true">
      <path d="m3 9 9-5 9 5-9 5-9-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7 11v4.2c0 .8 2 2.8 5 2.8s5-2 5-2.8V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M21 9v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function TeacherIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-[#D97706]" aria-hidden="true">
      <path d="M3 20h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 20v-9h12v9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m4 11 8-6 8 6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function OrganizationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-[#059669]" aria-hidden="true">
      <path d="M5 20V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5V20" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 20h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 8h1M14 8h1M9 12h1M14 12h1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10.5 20v-3h3v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PortalCard({ title, description, buttonLabel, onClick, icon, accentBg, accentBorder, hoverBorder, onDemoClick, demoLabel, loading }) {
  return (
    <article className={`group relative flex w-[320px] flex-col rounded-2xl border ${accentBorder} bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 ${hoverBorder} hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)]`}>
      <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border ${accentBg}`}>
        {icon}
      </div>
      <h3 className="mt-6 text-center font-display text-2xl font-bold text-[#1C1917]">{title}</h3>
      <p className="mt-3 text-center text-sm leading-6 text-[#78716C] flex-grow">{description}</p>
      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={onClick}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-[#F97316] to-[#FB923C] py-3 text-sm font-semibold text-white shadow-[0_0_16px_rgba(249,115,22,0.18)] transition-all duration-200 hover:shadow-[0_0_26px_rgba(249,115,22,0.28)] hover:-translate-y-0.5 disabled:opacity-60"
        >
          {buttonLabel}
        </button>
        {onDemoClick && (
          <button
            type="button"
            onClick={onDemoClick}
            disabled={loading}
            className="w-full rounded-xl border border-[#FDBA74] bg-[#FFF7ED] py-3 text-sm font-bold text-[#F97316] transition-all duration-200 hover:bg-[#FFEAD6] hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : demoLabel}
          </button>
        )}
      </div>
    </article>
  )
}

export default function PortalSelect() {
  const navigate = useNavigate()
  const leaveTimeoutRef = useRef(null)
  const [isLeaving, setIsLeaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigateWithTransition = useCallback((to) => {
    if (isLeaving) return
    setIsLeaving(true)
    leaveTimeoutRef.current = window.setTimeout(() => {
      navigate(to)
    }, 280)
  }, [isLeaving, navigate])

  useEffect(() => {
    document.title = 'StudyBuddy — Portal Select'
  }, [])

  const handleStudentDemo = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.loginStudent('dgowdagr01@gmail.com')
      localStorage.setItem('student_id', res.student_id)
      localStorage.setItem('student_name', res.name)
      navigateWithTransition('/app')
    } catch (err) {
      setError(err?.message || 'Student demo login failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleTeacherDemo = async () => {
    setLoading(true)
    setError('')
    try {
      const loginResult = await api.teacherLogin('dgowdagr02@gmail.com', 'demo123')
      const subjects = Array.isArray(loginResult.subjects)
        ? loginResult.subjects
        : (loginResult.subject ? [loginResult.subject] : [])
      const activeSubject = loginResult.active_subject || subjects[0] || null

      setTeacherSession({
        teacher_id: loginResult.teacher_id,
        full_name: loginResult.full_name,
        email: loginResult.email,
        org_id: loginResult.org_id,
        subjects,
        active_subject_id: activeSubject?.id ? String(activeSubject.id) : null,
        subject: activeSubject,
      })

      if (subjects.length > 1) {
        navigateWithTransition('/teacher/subjects')
      } else {
        navigateWithTransition('/teacher/home')
      }
    } catch (err) {
      setError(err?.message || 'Teacher demo login failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleOrgDemo = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.orgAdminLogin('dgowdagr03@gmail.com', 'demo123')
      setOrganizationSession({
        org_id: res.org_id,
        name: res.name,
        invite_code: res.invite_code,
        email: res.email,
      })
      navigateWithTransition('/organization/home')
    } catch (err) {
      setError(err?.message || 'Organization demo login failed.')
    } finally {
      setLoading(false)
    }
  }

  const [judgeModal, setJudgeModal] = useState({ isOpen: false, role: null })
  const [judgeCode, setJudgeCode] = useState('')
  const [judgeError, setJudgeError] = useState('')

  const openJudgeModal = (role) => {
    setJudgeModal({ isOpen: true, role })
    setJudgeCode('')
    setJudgeError('')
  }

  const handleJudgeSubmit = (e) => {
    e.preventDefault()
    if (judgeCode === '19780906') {
      localStorage.setItem('bypass_passcode', judgeCode)
      const roleToLaunch = judgeModal.role
      setJudgeModal({ isOpen: false, role: null })
      if (roleToLaunch === 'student') handleStudentDemo()
      if (roleToLaunch === 'teacher') handleTeacherDemo()
      if (roleToLaunch === 'org') handleOrgDemo()
    } else {
      setJudgeError('Incorrect private code')
    }
  }

  return (
    <div className={`portal-scene sb-page-shell relative min-h-screen overflow-hidden bg-[#FCFBF8] px-6 py-10 ${isLeaving ? 'sb-page-exit' : ''}`}>
      {judgeModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setJudgeModal({ isOpen: false, role: null })}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <h3 className="text-xl font-bold text-[#1C1917] mb-2">Judge Access</h3>
            <p className="text-sm text-[#78716C] mb-4">Please enter your private code to continue.</p>
            <form onSubmit={handleJudgeSubmit}>
              <input 
                autoFocus
                type="password"
                value={judgeCode}
                onChange={(e) => { setJudgeCode(e.target.value); setJudgeError('') }}
                placeholder="Enter code"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 mb-2 focus:border-[#F97316] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
              />
              {judgeError && <p className="text-sm text-red-500 mb-3">{judgeError}</p>}
              <button 
                type="submit"
                className="w-full mt-2 rounded-xl bg-gradient-to-r from-[#F97316] to-[#FB923C] py-3 text-sm font-semibold text-white shadow-md hover:-translate-y-0.5 transition-all"
              >
                Verify & Enter
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Light warm grid */}
      <div className="portal-grid" />
      {/* Very subtle warm radial accents */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(249,115,22,0.05),transparent_48%),radial-gradient(circle_at_82%_12%,rgba(251,146,60,0.04),transparent_44%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(252,251,248,0.12)_0%,rgba(252,251,248,0.25)_58%,rgba(252,251,248,0.5)_100%)]" />

      <div className="relative z-20 mx-auto w-full max-w-6xl">
        <button
          type="button"
          onClick={() => navigateWithTransition('/')}
          className="inline-flex items-center rounded-xl border border-[#E6E1DA] bg-white px-4 py-2 text-sm font-semibold text-[#78716C] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F6F4EF] hover:text-[#292524]"
        >
          ← Back to Landing
        </button>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col items-center justify-center text-center space-y-10">
        <div className="space-y-3">
          <div className="mx-auto flex items-center justify-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#F97316] to-[#FB923C] shadow-[0_0_16px_rgba(249,115,22,0.2)]">
              <span className="h-5 w-5 rounded-lg bg-white/90" />
            </span>
            <div className="text-left">
              <p className="font-display text-xl font-bold text-[#1C1917]">StudyBuddy</p>
              <p className="text-sm text-[#78716C]">Your AI-powered study companion</p>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-[38px] md:text-[52px] font-extrabold text-[#1C1917] leading-[1.1] drop-shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              Your AI tutor that{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #F97316, #FDBA74)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                never sleeps
              </span>
              .
            </h1>
            <p className="mt-4 text-[18px] text-[#78716C]">Upload your notes. Ask questions. Understand deeply.</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              <div className="flex -space-x-2">
                <span className="h-7 w-7 rounded-full border border-[#FCFBF8] bg-[#F97316] text-[10px] font-semibold text-white grid place-items-center">RT</span>
                <span className="h-7 w-7 rounded-full border border-[#FCFBF8] bg-[#F59E0B] text-[10px] font-semibold text-white grid place-items-center">AK</span>
                <span className="h-7 w-7 rounded-full border border-[#FCFBF8] bg-[#34D399] text-[10px] font-semibold text-white grid place-items-center">SB</span>
              </div>
              <p className="text-[13px] text-[#78716C]">Trusted by students at RIT and beyond</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-600 max-w-md mx-auto">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <PortalCard
            title="Student"
            description="Your personal AI tutor. Upload PDFs, ask questions by voice, take exams and track your progress daily."
            buttonLabel="Login as Student"
            onClick={() => navigateWithTransition('/student/login')}
            onDemoClick={() => openJudgeModal('student')}
            demoLabel="🔑 Direct Judge Access"
            loading={loading}
            icon={<StudentIcon />}
            accentBg="border-[#F97316]/20 bg-[#FFF7ED]"
            accentBorder="border-[#E6E1DA]"
            hoverBorder="hover:border-[#F97316]/40"
          />

          <PortalCard
            title="Teacher"
            description="Create exams, grade submissions, post announcements and watch your students grow."
            buttonLabel="Login as Teacher"
            onClick={() => navigateWithTransition('/teacher/login')}
            onDemoClick={() => openJudgeModal('teacher')}
            demoLabel="🔑 Direct Judge Access"
            loading={loading}
            icon={<TeacherIcon />}
            accentBg="border-[#F59E0B]/20 bg-[#FFFBEB]"
            accentBorder="border-[#E6E1DA]"
            hoverBorder="hover:border-[#F59E0B]/40"
          />

          <PortalCard
            title="Organization"
            description="Set up your institution, register teachers, manage subjects and authorize students at scale."
            buttonLabel="Login as Organization"
            onClick={() => navigateWithTransition('/organization/login')}
            onDemoClick={() => openJudgeModal('org')}
            demoLabel="🔑 Direct Judge Access"
            loading={loading}
            icon={<OrganizationIcon />}
            accentBg="border-[#34D399]/20 bg-[#ECFDF5]"
            accentBorder="border-[#E6E1DA]"
            hoverBorder="hover:border-[#34D399]/40"
          />
        </div>
      </div>
    </div>
  )
}
