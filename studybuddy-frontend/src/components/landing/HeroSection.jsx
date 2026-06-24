import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const headlines = [
  'Studying alone is hard.',
  'What if you had a tutor who never forgot?',
  'Learn like you finally understand.',
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 0.61, 0.36, 1] },
  }),
}

export default function HeroSection() {
  const navigate = useNavigate()
  const { scrollYProgress } = useScroll()
  const mockupY = useTransform(scrollYProgress, [0, 0.3], [0, -40])
  const mockupScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.96])
  const [headlineIndex, setHeadlineIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % headlines.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative pt-28 pb-4 md:pt-36 md:pb-6 overflow-hidden">
      {/* Warm background orbs — very subtle on light bg */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.07),transparent_70%)] blur-3xl" />
        <div className="absolute top-20 left-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(251,146,60,0.04),transparent_70%)] blur-2xl" />
        <div className="absolute top-40 right-[10%] w-[350px] h-[350px] bg-[radial-gradient(circle,rgba(245,158,11,0.04),transparent_70%)] blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#F97316]/25 bg-[#F97316]/[0.07] px-4 py-1.5 text-[12px] font-semibold tracking-wide text-[#EA580C] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F97316] animate-[warmPulse_4s_ease-in-out_infinite]" />
            Your Learning Companion
          </span>
        </motion.div>

        {/* Rotating Headline */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="mt-4 md:mt-6 h-[80px] md:h-[110px] flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.h1
              key={headlineIndex}
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
              transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
              className="font-display text-[clamp(2.2rem,5.5vw,4.2rem)] font-bold leading-[1.1] tracking-tight text-[#1C1917]"
            >
              {headlines[headlineIndex]}
            </motion.h1>
          </AnimatePresence>
        </motion.div>

        {/* Subheading */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="mx-auto mt-2 max-w-2xl text-[17px] md:text-[19px] leading-relaxed text-[#78716C] font-normal"
        >
          StudyBuddy reads your notes, understands your gaps, and guides you
          to mastery — so you never feel lost in a subject again.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate('/get-started')}
            className="group relative px-7 py-3.5 rounded-full text-[15px] font-semibold text-white bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#FB923C] hover:to-[#F97316] transition-all duration-300 shadow-[0_0_24px_rgba(249,115,22,0.25)] hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:-translate-y-0.5"
          >
            <span className="relative z-10 flex items-center gap-2">
              Be an Early User
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </button>

          <button
            onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="group flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold text-[#78716C] border border-[#E6E1DA] bg-white hover:bg-[#F6F4EF] hover:border-[#F97316]/30 hover:text-[#292524] transition-all duration-300 hover:-translate-y-0.5"
          >
            See How It Works
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          </button>
        </motion.div>

        {/* Dashboard Mockup — compact, perspective card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          style={{ y: mockupY, scale: mockupScale }}
          className="relative mt-14 md:mt-16 mx-auto max-w-4xl"
        >
          {/* Soft warm glow halo */}
          <div className="absolute -inset-6 bg-gradient-to-b from-[#F97316]/05 to-transparent rounded-3xl blur-3xl pointer-events-none" />

          {/* Perspective tilt wrapper */}
          <div
            className="relative"
            style={{
              perspective: '1400px',
              perspectiveOrigin: '50% 30%',
            }}
          >
            <motion.div
              initial={{ rotateX: 14 }}
              animate={{ rotateX: 4 }}
              transition={{ duration: 1.4, delay: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative rounded-2xl border border-[#E6E1DA] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.10),0_8px_20px_rgba(249,115,22,0.06)] overflow-hidden"
            >
              {/* Browser chrome bar */}
              <div className="flex items-center gap-1.5 px-4 py-3 bg-[#F6F4EF] border-b border-[#E6E1DA]">
                <div className="h-2.5 w-2.5 rounded-full bg-[#F97316]/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#E6E1DA]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#E6E1DA]" />
                <div className="ml-4 flex-1 h-5 rounded-md bg-white border border-[#E6E1DA] max-w-[280px]">
                  <div className="flex items-center gap-1.5 px-2 h-full">
                    <div className="h-2 w-2 rounded-full bg-[#F97316]/40" />
                    <div className="h-1.5 w-32 rounded bg-[#E6E1DA]" />
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <div className="h-1.5 w-14 rounded bg-[#E6E1DA]" />
                </div>
              </div>

              {/* Inline UI Mockup — two-column layout preview */}
              <div className="flex h-[340px] md:h-[400px] overflow-hidden">
                {/* Sidebar */}
                <div className="w-[160px] shrink-0 border-r border-[#E6E1DA] bg-[#FCFBF8] p-3 flex flex-col gap-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#F97316] to-[#EA580C]" />
                    <div className="h-2.5 w-20 rounded bg-[#1C1917]/20" />
                  </div>
                  {['Home', 'My Classes', 'Library', 'Flashcards', 'Schedule'].map((item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 rounded-lg px-2 py-2 ${i === 0 ? 'bg-[#F97316]/10 border-l-2 border-[#F97316]' : ''}`}
                    >
                      <div className={`h-3 w-3 rounded ${i === 0 ? 'bg-[#F97316]' : 'bg-[#E6E1DA]'}`} />
                      <div className={`h-2 rounded ${i === 0 ? 'w-8 bg-[#F97316]/60' : 'w-12 bg-[#E6E1DA]'}`} />
                    </div>
                  ))}
                  <div className="mt-auto pt-3 border-t border-[#E6E1DA]">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#F97316] to-[#FB923C]" />
                      <div>
                        <div className="h-2 w-14 rounded bg-[#1C1917]/20 mb-1" />
                        <div className="h-1.5 w-10 rounded bg-[#E6E1DA]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main content area */}
                <div className="flex-1 bg-white p-4 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="h-3 w-28 rounded bg-[#1C1917]/15 mb-1.5" />
                      <div className="h-2 w-40 rounded bg-[#E6E1DA]" />
                    </div>
                    <div className="h-8 w-24 rounded-full bg-gradient-to-r from-[#F97316] to-[#FB923C]" />
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[['72%', 'Mastery'], ['24h', 'Study Time'], ['🔥 5', 'Day Streak']].map(([val, label]) => (
                      <div key={label} className="rounded-xl border border-[#E6E1DA] bg-[#FCFBF8] p-3 text-center">
                        <p className="text-[15px] font-bold text-[#1C1917]">{val}</p>
                        <p className="text-[10px] text-[#78716C] mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* AI Chat preview */}
                  <div className="rounded-xl border border-[#E6E1DA] bg-[#FCFBF8] p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-r from-[#F97316] to-[#FB923C]" />
                      <div className="h-2 w-16 rounded bg-[#1C1917]/20" />
                      <div className="ml-auto h-2 w-2 rounded-full bg-[#34D399] animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 w-full rounded bg-[#E6E1DA]" />
                      <div className="h-2 w-4/5 rounded bg-[#E6E1DA]" />
                      <div className="h-2 w-3/5 rounded bg-[#E6E1DA]" />
                    </div>
                  </div>

                  {/* Flashcard preview */}
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex-1 rounded-lg border border-[#F97316]/20 bg-[#FFF7ED] p-2">
                        <div className="h-1.5 w-12 rounded bg-[#F97316]/30 mb-1.5" />
                        <div className="h-1.5 w-full rounded bg-[#E6E1DA]" />
                        <div className="h-1.5 w-3/4 rounded bg-[#E6E1DA] mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom fade overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FCFBF8]/80 to-transparent pointer-events-none" />
            </motion.div>

            {/* Floating badge — social proof */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2, ease: [0.22, 0.61, 0.36, 1] }}
              className="absolute -right-4 -bottom-4 md:-right-8 md:-bottom-6 bg-white border border-[#E6E1DA] shadow-[0_8px_30px_rgba(0,0,0,0.10)] rounded-2xl px-4 py-3 flex items-center gap-3"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#34D399] to-[#059669] flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#1C1917] leading-none">Concept mastered!</p>
                <p className="text-[11px] text-[#78716C] mt-0.5">Integration by Parts ✓</p>
              </div>
            </motion.div>

            {/* Floating badge — streak */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4, ease: [0.22, 0.61, 0.36, 1] }}
              className="absolute -left-4 -bottom-4 md:-left-8 md:-bottom-6 bg-white border border-[#E6E1DA] shadow-[0_8px_30px_rgba(0,0,0,0.10)] rounded-2xl px-4 py-3 flex items-center gap-3"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center shrink-0 text-lg">
                🔥
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#1C1917] leading-none">5-day streak!</p>
                <p className="text-[11px] text-[#78716C] mt-0.5">Keep it going 💪</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
