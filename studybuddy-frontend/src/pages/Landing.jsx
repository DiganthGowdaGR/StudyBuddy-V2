import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { supabase } from '../lib/supabase'

const AUTH_SIDE_VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4'

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-zinc-300"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export default function Landing({ onAuthSuccess }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'StudyBuddy — Login'
  }, [])

  const finishAuth = (res) => {
    if (typeof onAuthSuccess === 'function') {
      onAuthSuccess(res)
    } else {
      localStorage.setItem('student_id', res.student_id)
      localStorage.setItem('student_name', res.name)
    }
    navigate('/app')
  }

  const handleDirectDemoAccess = async () => {
    const bypassPasscode = localStorage.getItem('bypass_passcode')
    if (bypassPasscode !== '19780906') {
      const code = prompt('Please enter the private code to access direct judge mode:')
      if (code === '19780906') {
        localStorage.setItem('bypass_passcode', code)
      } else {
        setError('Incorrect private code')
        return
      }
    }

    setLoading(true)
    setError('')
    setEmail('dgowdagr01@gmail.com')
    try {
      const res = await api.loginStudent('dgowdagr01@gmail.com')
      finishAuth(res)
    } catch (err) {
      setError(err?.message || 'Student demo login failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setError('Email is required.')
      return
    }

    setLoading(true)
    setError('')
    setSuccessMessage('')
    try {
      const res = await api.loginStudent(normalizedEmail)
      finishAuth(res)
    } catch (err) {
      setError(err?.message || 'No account found. Please register/join the waiting list.')
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedName = 'Student Guest'

    try {
      await api.joinWaitingList(normalizedName, normalizedEmail, 'student')
      setSuccessMessage('You have been successfully added to our waiting list! We will notify you once access opens up.')
      setEmail('')
    } catch (err) {
      setError(err?.message || 'Failed to submit to waiting list. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#FCFBF8] px-4 py-6 md:px-6 md:py-10 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(249,115,22,0.06),transparent_48%),radial-gradient(circle_at_84%_20%,rgba(251,146,60,0.04),transparent_42%)]" />

      <div className="relative z-10 w-full max-w-6xl overflow-hidden rounded-2xl border border-[#E6E1DA] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
        <div className="grid min-h-[720px] grid-cols-1 md:grid-cols-2">
          <section className="relative hidden md:block">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
            >
              <source src={AUTH_SIDE_VIDEO_URL} type="video/mp4" />
            </video>
          </section>

          <section className="flex items-center justify-center bg-white p-6 md:p-10">
            <div className="w-full max-w-sm space-y-4">
              <button
                type="button"
                onClick={() => navigate('/get-started')}
                className="inline-flex items-center gap-2 text-sm text-[#78716C] transition-colors hover:text-[#292524]"
              >
                <span className="text-lg leading-none">←</span>
                <span>Back to portal</span>
              </button>

              <div className="text-center space-y-3">
                <div className="mx-auto inline-flex p-2 rounded-md border border-[#E6E1DA] bg-[#F6F4EF]">
                  <UserIcon />
                </div>
                <div>
                  <h1 className="text-4xl font-display font-semibold tracking-tight text-[#1C1917]">
                    {mode === 'login' ? 'Sign In' : 'Be an Early User'}
                  </h1>
                  <p className="mt-1.5 text-sm text-[#78716C]">
                    {mode === 'login' 
                      ? 'Access your Student Portal account' 
                      : 'StudyBuddy is currently in private beta. Join the waitlist to reserve your spot.'}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-1 rounded-md border border-[#E6E1DA] bg-[#F6F4EF] p-1">
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); setSuccessMessage('') }}
                  className={`rounded-md py-2 text-sm font-medium transition-colors ${mode === 'signup' ? 'bg-white text-[#1C1917] shadow-sm' : 'text-[#78716C] hover:text-[#292524]'}`}
                >
                  Join Waitlist
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccessMessage('') }}
                  className={`rounded-md py-2 text-sm font-medium transition-colors ${mode === 'login' ? 'bg-white text-[#1C1917] shadow-sm' : 'text-[#78716C] hover:text-[#292524]'}`}
                >
                  Sign In
                </button>
              </div>

              <form onSubmit={mode === 'login' ? handleLoginSubmit : handleAuth} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#292524]">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-xl border border-[#D4CDBF] bg-white px-4 text-base text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
                    placeholder="you@example.com"
                  />
                </div>

                {error && <p className="text-xs text-rose-500">{error}</p>}
                {successMessage && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {successMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#F97316] to-[#FB923C] px-4 text-base font-semibold text-white transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2 justify-center">
                      <LoadingSpinner />
                      <span>Submitting...</span>
                    </span>
                  ) : (
                    mode === 'login' ? 'Sign in to your account' : 'Request Early Access'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDirectDemoAccess}
                  disabled={loading}
                  className="sb-glass-shimmer-purple inline-flex h-12 w-full items-center justify-center rounded-xl px-4 text-base font-bold transition-all disabled:opacity-60"
                >
                  🔑 Direct Judge Access
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
