import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import HeroSection from '../components/landing/HeroSection'
import FeaturesGrid from '../components/landing/FeaturesGrid'
import NotebookSection from '../components/landing/NotebookSection'
import AITutorSection from '../components/landing/AITutorSection'
import AdaptiveLearningSection from '../components/landing/AdaptiveLearningSection'
import CTASection from '../components/landing/CTASection'
import TeacherOrgSection from '../components/landing/TeacherOrgSection'
import Footer from '../components/landing/Footer'
import { api } from '../services/api'

/* 
 * Emotional transition beat — sits between sections to add
 * storytelling context and break the section-section-section monotony.
 */
function StoryBeat({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
      className={`mx-auto max-w-3xl px-6 py-8 md:py-12 text-center ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default function ProductLanding() {
  const navigate = useNavigate()
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'StudyBuddy — Your AI Learning Companion'
  }, [])

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const displayName = name.trim() || email.split('@')[0]
      await api.joinWaitingList(displayName, email.trim().toLowerCase(), role)
      setSuccess(true)
      setName('')
      setEmail('')
    } catch (err) {
      setError(err.message || 'Failed to join the waiting list. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#FCFBF8] text-[#292524] antialiased selection:bg-[#F97316]/20 selection:text-[#1C1917]">
      {/* Subtle warm grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Premium ambient decorative orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] left-[5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#FED7AA]/40 via-[#FFEAD6]/20 to-transparent blur-[120px] opacity-75 animate-float-slow" />
        <div className="absolute top-[25%] -right-[10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-[#FEF3C7]/50 via-[#FDE68A]/15 to-transparent blur-[140px] opacity-80 animate-float-medium" />
        <div className="absolute bottom-[20%] -left-[15%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[#FEE2E2]/40 via-[#FECACA]/15 to-transparent blur-[160px] opacity-70 animate-float-fast" />
        {/* Additional accent orb for rich modern depth */}
        <div className="absolute top-[60%] left-[30%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-[#FFF7ED] via-[#FFEDD5]/30 to-transparent blur-[110px] opacity-60 animate-float-slow" style={{ animationDelay: '-12s' }} />
      </div>

      <Navbar
        onStartLearningClick={() => navigate('/get-started')}
        onWaitlistClick={() => setIsWaitlistOpen(true)}
      />

      <main className="relative z-10">
        <HeroSection onWaitlistClick={() => setIsWaitlistOpen(true)} />

        {/* --- Emotional beat: The problem --- */}
        <StoryBeat>
          <p className="font-serif text-[22px] md:text-[28px] italic font-medium leading-relaxed text-[#57534E]">
            You&apos;ve got <span className="text-[#1C1917] font-semibold border-b border-[#F97316]/30">50 PDFs</span>, notes in{' '}
            <span className="text-[#1C1917] font-semibold border-b border-[#F97316]/30">4 different apps</span>, and the exam is in{' '}
            <span className="text-[#EA580C] not-italic font-bold">3 days</span>.
          </p>
          <p className="mt-4 font-serif text-[17px] italic text-[#78716C]">
            Sound familiar? You&apos;re not alone.
          </p>
        </StoryBeat>

        {/* Warm divider */}
        <div className="mx-auto max-w-6xl px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-[#E6E1DA] to-transparent" />
        </div>

        <div className="relative">
          <FeaturesGrid />
        </div>

        {/* --- Emotional beat: Transition to notebook --- */}
        <StoryBeat>
          <p className="font-serif text-[22px] md:text-[28px] italic font-medium leading-relaxed text-[#57534E]">
            What if every note you ever took{' '}
            <span className="text-[#1C1917] font-semibold border-b border-[#F97316]/30">remembered itself</span> — and helped you{' '}
            <span className="text-[#EA580C] not-italic font-bold">study smarter</span>?
          </p>
        </StoryBeat>

        <div className="mx-auto max-w-6xl px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-[#E6E1DA] to-transparent" />
        </div>

        <div className="relative">
          <NotebookSection />
        </div>

        {/* --- Emotional beat: Transition to AI tutor --- */}
        <StoryBeat>
          <p className="font-serif text-[22px] md:text-[28px] italic font-medium leading-relaxed text-[#57534E]">
            Everyone gets stuck.{' '}
            <span className="text-[#1C1917] font-semibold border-b border-[#F97316]/30">The difference is having someone</span> who helps you{' '}
            <span className="text-[#EA580C] not-italic font-bold">get unstuck</span>.
          </p>
        </StoryBeat>

        <div className="mx-auto max-w-6xl px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-[#E6E1DA] to-transparent" />
        </div>

        <div className="relative">
          <AITutorSection />
        </div>

        {/* --- Emotional beat: Transition to progress --- */}
        <StoryBeat>
          <p className="font-serif text-[22px] md:text-[28px] italic font-medium leading-relaxed text-[#57534E]">
            The hardest part of studying isn&apos;t learning.{' '}
            <span className="text-[#1C1917] font-semibold border-b border-[#F97316]/30">It&apos;s knowing</span>{' '}
            <span className="text-[#EA580C] not-italic font-bold">what to study next</span>.
          </p>
        </StoryBeat>

        <div className="mx-auto max-w-6xl px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-[#E6E1DA] to-transparent" />
        </div>

        <div className="relative">
          <AdaptiveLearningSection />
        </div>

        {/* --- Emotional beat: Final CTA transition --- */}
        <StoryBeat>
          <p className="font-serif text-[22px] md:text-[28px] italic font-medium leading-relaxed text-[#57534E]">
            And it's not just for students. StudyBuddy brings{' '}
            <span className="text-[#1C1917] font-semibold border-b border-[#F97316]/30">teachers and students</span> together in one{' '}
            <span className="text-[#EA580C] not-italic font-bold">seamless platform</span>.
          </p>
        </StoryBeat>

        <div className="mx-auto max-w-6xl px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-[#E6E1DA] to-transparent" />
        </div>

        <div className="relative">
          <TeacherOrgSection />
        </div>

        {/* --- Final warm divider before emotional close --- */}
        <div className="mx-auto max-w-6xl px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-[#E6E1DA] to-transparent" />
        </div>

        <div className="relative">
          <CTASection onWaitlistClick={() => setIsWaitlistOpen(true)} />
        </div>
      </main>

      <Footer />

      {/* Waitlist Modal — pure inline styles to guarantee visibility */}
      {isWaitlistOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 12, 10, 0.82)',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
            padding: '16px',
          }}
          onClick={() => setIsWaitlistOpen(false)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              border: '1px solid #e5e7eb',
              padding: '28px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.20)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
              {/* Close Button */}
              <button
                onClick={() => setIsWaitlistOpen(false)}
                className="absolute top-5 right-5 flex items-center justify-center h-8 w-8 rounded-full border border-[#E6E1DA] bg-[#FCFBF8]/80 hover:bg-[#F6F4EF] text-[#78716C] hover:text-[#292524] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>

              {success ? (
                <div className="text-center py-6 space-y-4">
                  <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-3xl font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-[#1C1917]">You're on the list!</h3>
                    <p className="mt-2 text-sm text-[#78716C] leading-relaxed">
                      Thank you for your interest! We've successfully registered your details. We will notify you once access opens up.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSuccess(false)
                      setIsWaitlistOpen(false)
                    }}
                    className="sb-glass-shimmer-orange mt-4 w-full py-3 rounded-xl font-semibold text-sm cursor-pointer"
                  >
                    Awesome
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="text-center">
                    <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F97316]/10 to-[#EA580C]/10 border border-[#F97316]/20">
                      <span className="text-2xl">✨</span>
                    </div>
                    <h2 className="text-2xl font-display font-bold text-[#1C1917]">Be an Early User</h2>
                    <p className="mt-1.5 text-sm text-[#78716C]">
                      Join the waitlist and reserve your spot for early access.
                    </p>
                  </div>

                  {/* Role selector cards */}
                  <div>
                    <label className="text-xs font-semibold text-[#44403C] uppercase tracking-wider mb-2 block">I am a *</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        {
                          value: 'student',
                          label: 'Student',
                          desc: 'Personal AI tutor & smart notes',
                          icon: (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                            </svg>
                          ),
                          color: 'from-[#F97316]/10 to-[#EA580C]/5',
                          border: 'border-[#F97316]',
                          icon_color: 'text-[#F97316]',
                        },
                        {
                          value: 'teacher',
                          label: 'Teacher',
                          desc: 'Manage classes & grade exams',
                          icon: (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                              <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                          ),
                          color: 'from-emerald-500/10 to-emerald-400/5',
                          border: 'border-emerald-500',
                          icon_color: 'text-emerald-600',
                        },
                        {
                          value: 'org',
                          label: 'Organization',
                          desc: 'Manage teachers & students',
                          icon: (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="7" width="20" height="14" rx="2"/>
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                            </svg>
                          ),
                          color: 'from-violet-500/10 to-violet-400/5',
                          border: 'border-violet-500',
                          icon_color: 'text-violet-600',
                        },
                      ].map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRole(r.value)}
                          className={`relative flex flex-col items-center text-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                            role === r.value
                              ? `bg-gradient-to-b ${r.color} ${r.border} shadow-md scale-[1.03]`
                              : 'border-[#E6E1DA] bg-white/60 hover:border-[#D4CDBF] hover:bg-white/80 hover:scale-[1.01]'
                          }`}
                        >
                          <div className={`${role === r.value ? r.icon_color : 'text-[#78716C]'} transition-colors`}>
                            {r.icon}
                          </div>
                          <span className={`text-[11px] font-bold leading-tight ${role === r.value ? 'text-[#1C1917]' : 'text-[#44403C]'}`}>
                            {r.label}
                          </span>
                          {role === r.value && (
                            <div className={`absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full flex items-center justify-center text-white ${r.border.replace('border-', 'bg-')}`} style={{background: r.value === 'student' ? '#F97316' : r.value === 'teacher' ? '#10b981' : '#7c3aed'}}>
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                    {error && (
                      <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-600 font-medium">
                        {error}
                      </div>
                    )}
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#44403C] uppercase tracking-wider">Full Name <span className="normal-case text-[#78716C]">(optional)</span></label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Carter"
                        className="h-11 w-full rounded-xl border border-[#D4CDBF] bg-white/70 px-4 text-sm text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#44403C] uppercase tracking-wider">Email Address *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@example.com"
                        required
                        className="h-11 w-full rounded-xl border border-[#D4CDBF] bg-white/70 px-4 text-sm text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="sb-glass-shimmer-orange mt-1 w-full h-11 rounded-xl font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Joining...</span>
                        </>
                      ) : (
                        <>
                          <span>Join as {role === 'student' ? 'Student' : role === 'teacher' ? 'Teacher' : 'Organization'} →</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  )
}
