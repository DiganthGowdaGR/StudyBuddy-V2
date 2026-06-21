import React from 'react'
import { motion } from 'framer-motion'

const transformations = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    before: 'Scattered across apps',
    after: 'Instantly searchable',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    before: 'Disconnected facts',
    after: 'Connected understanding',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
    before: 'Just words on a page',
    after: 'AI-powered study material',
  },
]

export default function NotebookSection() {
  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      {/* Very soft accent glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(249,115,22,0.04),transparent_70%)] blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <span className="text-[12px] font-semibold tracking-[0.2em] text-[#F97316] uppercase">
              Your Notebook
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-[2.5rem] font-bold tracking-tight text-[#1C1917] leading-tight">
              Your notes are smarter
              <br />
              <span className="bg-gradient-to-r from-[#F97316] to-[#FB923C] bg-clip-text text-transparent">
                than you think.
              </span>
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-[#78716C] max-w-md">
              Every note you take becomes part of your learning story.
              StudyBuddy connects your ideas, surfaces what matters for exams,
              and turns scattered thoughts into real understanding.
            </p>

            {/* Before → After transformations */}
            <div className="mt-8 space-y-4">
              {transformations.map((t, i) => (
                <motion.div
                  key={t.after}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.22, 0.61, 0.36, 1] }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F97316]/10 text-[#F97316]">
                    {t.icon}
                  </div>
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className="text-[#78716C]/50 line-through">{t.before}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                    <span className="font-semibold text-[#292524]">{t.after}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual side — Notebook mockup (paper-style on white) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative"
          >
            <div className="relative rounded-2xl border border-[#E6E1DA] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.07)]">
              {/* Notebook header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="h-3 w-3 rounded-full bg-[#F97316]/70" />
                <span className="text-[13px] font-medium text-[#78716C]">Calculus II — Integration</span>
              </div>

              {/* Note content */}
              <div className="space-y-3">
                <div className="rounded-lg bg-[#F6F4EF] border border-[#E6E1DA] p-4">
                  <p className="text-[14px] font-semibold text-[#1C1917]">Integration by Parts</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#78716C]">
                    The formula ∫u·dv = u·v − ∫v·du is essentially the product rule
                    running in reverse. Choose u as the function that simplifies
                    when differentiated...
                  </p>
                </div>

                <div className="rounded-lg bg-[#FFF7ED] border border-[#F97316]/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-[#F97316] to-[#EA580C] flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-semibold text-[#EA580C] uppercase tracking-wider">StudyBuddy noticed</span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-[#78716C]">
                    This connects to your Week 4 notes on the Product Rule.
                    You scored 45% on related problems — want me to create
                    practice flashcards for this?
                  </p>
                </div>

                {/* Connected notes */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {['Product Rule', 'Definite Integrals', 'U-Substitution'].map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-[#F97316]/20 bg-[#FFF7ED] px-3 py-1 text-[11px] font-medium text-[#EA580C]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Subtle glow accent */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[radial-gradient(circle,rgba(249,115,22,0.05),transparent_70%)] blur-2xl pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
