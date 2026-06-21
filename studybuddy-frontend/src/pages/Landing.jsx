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

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedName = name.trim()

    try {
      let res
      if (mode === 'signup') {
        res = await api.registerStudent(normalizedName, normalizedEmail)
      } else {
        res = await api.loginStudent(normalizedEmail)
      }

      finishAuth(res)
    } catch (err) {
      const message = err?.message || 'Authentication failed. Please try again.'
      const lowered = String(message).toLowerCase()

      if (
        mode === 'signup' &&
        (lowered.includes('already registered') ||
          lowered.includes('already exist') ||
          lowered.includes('duplicate') ||
          lowered.includes('unique'))
      ) {
        setError('This email already has an account. Please use Login tab.')
      } else {
        setError(message)
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      // Supabase starts provider auth and redirects back to /auth/callback.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (err) {
      setError(err.message)
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
                  <h1 className="text-5xl font-display font-semibold tracking-tight text-[#1C1917]">Sign in</h1>
                  <p className="mt-1 text-lg text-[#78716C]">Access your secure account</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-1 rounded-md border border-[#E6E1DA] bg-[#F6F4EF] p-1">
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError('') }}
                  className={`rounded-md py-2 text-sm font-medium transition-colors ${mode === 'signup' ? 'bg-white text-[#1C1917] shadow-sm' : 'text-[#78716C] hover:text-[#292524]'}`}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError('') }}
                  className={`rounded-md py-2 text-sm font-medium transition-colors ${mode === 'login' ? 'bg-white text-[#1C1917] shadow-sm' : 'text-[#78716C] hover:text-[#292524]'}`}
                >
                  Login
                </button>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#E6E1DA] bg-white text-base font-semibold text-[#292524] transition-colors hover:bg-[#F6F4EF] disabled:opacity-60"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-800"></span>
                </div>
                <div className="relative flex justify-center text-[11px] uppercase text-zinc-500">
                  <span className="bg-[#FCFBF8] px-3">Or sign in with email</span>
                </div>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#292524]">Full name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 w-full rounded-xl border border-[#D4CDBF] bg-white px-4 text-base text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
                      placeholder="Enter your full name"
                    />
                  </div>
                )}

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

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#F97316] to-[#FB923C] px-4 text-base font-semibold text-white transition-colors hover:brightness-110 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2 justify-center">
                      <LoadingSpinner />
                      <span>{mode === 'signup' ? 'Creating account...' : 'Signing in...'}</span>
                    </span>
                  ) : (
                    mode === 'signup' ? 'Create your account' : 'Sign in to your account'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDirectDemoAccess}
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#FDBA74] bg-[#FFF7ED] px-4 text-base font-bold text-[#F97316] hover:bg-[#FFEAD6] transition-colors disabled:opacity-60"
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
