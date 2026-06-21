import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import { api } from '../services/api'
import { setOrganizationSession } from '../utils/organizationSession'

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

function EyeIcon() {
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
      className="h-4 w-4 text-[#78716C]"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
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
      className="h-4 w-4 text-[#78716C]"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )
}

export default function OrganizationLogin() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)

  useEffect(() => {
    document.title = 'StudyBuddy â€” Organization'
  }, [])

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [orgName, setOrgName] = useState('')
  const [orgDescription, setOrgDescription] = useState('')
  const [orgEmail, setOrgEmail] = useState('')
  const [orgPassword, setOrgPassword] = useState('')

  const storeAndNavigate = (res) => {
    setOrganizationSession({
      org_id: res.org_id,
      name: res.name,
      invite_code: res.invite_code,
      email: res.email,
    })
    navigate('/organization/home')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginEmail.trim() || !loginPassword) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await api.orgAdminLogin(loginEmail.trim().toLowerCase(), loginPassword)
      storeAndNavigate(res)
    } catch (err) {
      setError(err.message || 'Organization login failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleDirectDemoAccess = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    setLoginEmail('dgowdagr03@gmail.com')
    setLoginPassword('demo123')
    try {
      const res = await api.orgAdminLogin('dgowdagr03@gmail.com', 'demo123')
      storeAndNavigate(res)
    } catch (err) {
      setError(err.message || 'Organization demo login failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!orgName.trim() || !orgEmail.trim() || !orgPassword) {
      setError('Organization name, email, and password are required.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await api.orgAdminRegister({
        name: orgName.trim(),
        description: orgDescription.trim(),
        email: orgEmail.trim().toLowerCase(),
        password: orgPassword,
      })
      setSuccess(`Organization created. Invite code: ${res.invite_code}`)
      storeAndNavigate(res)
    } catch (err) {
      setError(err.message || 'Could not create organization account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#FCFBF8] px-4 py-6 md:px-6 md:py-10 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(249,115,22,0.1),transparent_48%),radial-gradient(circle_at_84%_20%,rgba(251,146,60,0.06),transparent_42%)]" />

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
                  <h1 className="text-5xl font-semibold tracking-tight text-[#1C1917]">Sign in</h1>
                  <p className="mt-1 text-lg text-[#78716C]">Access your secure account</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-1 rounded-md border border-[#E6E1DA] bg-[#F6F4EF] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setError('')
                    setSuccess('')
                  }}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${mode === 'login' ? 'bg-white text-[#1C1917] shadow-sm' : 'text-[#78716C] hover:text-[#292524]'}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setError('')
                    setSuccess('')
                  }}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${mode === 'register' ? 'bg-white text-[#1C1917] shadow-sm' : 'text-[#78716C] hover:text-[#292524]'}`}
                >
                  Register
                </button>
              </div>

              {error && <p className="text-xs text-rose-500">{error}</p>}
              {success && <p className="text-xs text-emerald-600">{success}</p>}

              {mode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#292524]">Email address</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="organization@example.com"
                      className="h-12 w-full rounded-xl border border-[#D4CDBF] bg-white px-4 text-base text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#292524]">Password</label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="h-12 w-full rounded-xl border border-[#D4CDBF] bg-white px-4 pr-11 text-base text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center"
                        aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      >
                        {showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#F97316] to-[#FB923C] px-4 text-base font-semibold text-white transition-colors hover:brightness-110 disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <LoadingSpinner />
                        Signing in...
                      </span>
                    ) : 'Sign in to your account'}
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
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#292524]">Organization name</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Organization name"
                      className="h-12 w-full rounded-xl border border-[#D4CDBF] bg-white px-4 text-base text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#292524]">Description</label>
                    <input
                      type="text"
                      value={orgDescription}
                      onChange={(e) => setOrgDescription(e.target.value)}
                      placeholder="Organization description"
                      className="h-12 w-full rounded-xl border border-[#D4CDBF] bg-white px-4 text-base text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#292524]">Admin email</label>
                    <input
                      type="email"
                      value={orgEmail}
                      onChange={(e) => setOrgEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="h-12 w-full rounded-xl border border-[#D4CDBF] bg-white px-4 text-base text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#292524]">Password</label>
                    <div className="relative">
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        value={orgPassword}
                        onChange={(e) => setOrgPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="h-12 w-full rounded-xl border border-[#D4CDBF] bg-white px-4 pr-11 text-base text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center"
                        aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRegisterPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#F97316] to-[#FB923C] px-4 text-base font-semibold text-white transition-colors hover:brightness-110 disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <LoadingSpinner />
                        Creating organization...
                      </span>
                    ) : 'Create organization account'}
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}


