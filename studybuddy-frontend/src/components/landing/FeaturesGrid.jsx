import React from 'react'
import { motion } from 'framer-motion'

const features = [
  {
    title: 'Smart Notes',
    description: 'Write once, understand forever. Your notes become a living knowledge base that grows with you.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    gradient: 'from-[#F97316] to-[#EA580C]',
    glowColor: 'rgba(249,115,22,0.08)',
  },
  {
    title: 'AI Tutor',
    description: "Like having a patient teacher who's read all your notes and never gets tired of explaining.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 10h.01" />
        <path d="M12 10h.01" />
        <path d="M16 10h.01" />
      </svg>
    ),
    gradient: 'from-[#FB923C] to-[#F97316]',
    glowColor: 'rgba(251,146,60,0.08)',
  },
  {
    title: 'Flashcards',
    description: 'Auto-generated from your notes. Review what you need, skip what you know. Study smarter.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 10h20" />
        <path d="M12 4v16" />
      </svg>
    ),
    gradient: 'from-[#34D399] to-[#059669]',
    glowColor: 'rgba(52,211,153,0.08)',
  },
  {
    title: 'Voice Learning',
    description: 'Talk through concepts out loud. Sometimes hearing it is all you need to make it click.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    gradient: 'from-[#F59E0B] to-[#D97706]',
    glowColor: 'rgba(245,158,11,0.08)',
  },
  {
    title: 'Study Planner',
    description: "Know exactly what to study and when. No more guessing. No more last-minute panic.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
    gradient: 'from-[#FDBA74] to-[#F97316]',
    glowColor: 'rgba(253,186,116,0.08)',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 0.61, 0.36, 1] },
  },
}

export default function FeaturesGrid() {
  return (
    <section id="how-it-works" className="relative py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="text-[12px] font-semibold tracking-[0.2em] text-[#F97316] uppercase">
            Everything in One Place
          </span>
          <h2 className="mt-3 font-display text-3xl md:text-[2.75rem] font-bold tracking-tight text-[#1C1917] leading-tight">
            Stop juggling 10 apps.
            <br />
            <span className="bg-gradient-to-r from-[#F97316] to-[#FB923C] bg-clip-text text-transparent">
              Start actually learning.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-[#78716C]">
            Notes, tutor, flashcards, planner — one workspace where everything
            works together to help you understand.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="group relative rounded-2xl border border-[#E6E1DA] bg-white p-6 hover:border-[#F97316]/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-all duration-300 cursor-default"
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(400px circle at 50% 30%, ${feature.glowColor}, transparent 60%)`,
                }}
              />

              {/* Icon */}
              <div className={`relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-sm`}>
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="relative z-10 mt-4 font-display text-[16px] font-semibold text-[#1C1917]">
                {feature.title}
              </h3>
              <p className="relative z-10 mt-2 text-[14px] leading-relaxed text-[#78716C]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
