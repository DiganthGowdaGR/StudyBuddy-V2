import React from 'react'
import { motion } from 'framer-motion'

const topics = [
  { name: 'Organic Chemistry', strength: 85, status: 'strong', color: '#34D399' },
  { name: 'Thermodynamics', strength: 62, status: 'growing', color: '#F97316' },
  { name: 'Calculus II', strength: 34, status: 'needs work', color: '#EF4444' },
  { name: 'Data Structures', strength: 91, status: 'strong', color: '#34D399' },
  { name: 'Linear Algebra', strength: 48, status: 'needs work', color: '#EF4444' },
  { name: 'Quantum Physics', strength: 73, status: 'growing', color: '#F97316' },
]

const revisions = [
  { topic: 'Integration by Parts', reason: 'You struggled with this last Tuesday', urgency: 'high', due: 'Today' },
  { topic: 'Eigenvalues', reason: 'Exam topic — review needed', urgency: 'high', due: 'Tomorrow' },
  { topic: 'Entropy & Enthalpy', reason: 'Fading memory — last reviewed 12 days ago', urgency: 'medium', due: 'This week' },
]

function ProgressRing({ value, size = 130, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#warmGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="warmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FDBA74" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-[#1C1917]">{value}%</span>
        <span className="text-[10px] text-[#78716C] uppercase tracking-wider font-semibold mt-0.5">Mastery</span>
      </div>
    </div>
  )
}

export default function AdaptiveLearningSection() {
  return (
    <section id="your-progress" className="relative py-12 md:py-16 overflow-hidden">
      {/* Accent glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.05),transparent_70%)] blur-3xl pointer-events-none" />

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
            Your Growth
          </span>
          <h2 className="mt-3 font-display text-3xl md:text-[2.5rem] font-bold tracking-tight text-[#1C1917] leading-tight">
            A tutor that remembers
            <br />
            <span className="bg-gradient-to-r from-[#F97316] to-[#FB923C] bg-clip-text text-transparent">
              everything about you.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-[#78716C]">
            StudyBuddy tracks what you know, what you&apos;re forgetting, and what
            needs attention next — so you always study the right thing at the right time.
          </p>
        </motion.div>

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Topic Mastery */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
            className="lg:col-span-2 rounded-2xl border border-[#E6E1DA] bg-white p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[15px] font-semibold text-[#1C1917]">How you&apos;re doing</h3>
              <div className="flex items-center gap-4">
                {[
                  { label: 'Strong', color: '#34D399' },
                  { label: 'Growing', color: '#F97316' },
                  { label: 'Needs work', color: '#EF4444' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-[11px] text-[#78716C]/60">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {topics.map((topic, i) => (
                <motion.div
                  key={topic.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 0.61, 0.36, 1] }}
                  className="flex items-center gap-4"
                >
                  <span className="text-[13px] text-[#78716C] w-36 shrink-0 truncate">{topic.name}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-[#E6E1DA] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${topic.strength}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.06, ease: [0.22, 0.61, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: topic.color }}
                    />
                  </div>
                  <span className="text-[12px] font-semibold w-8 text-right" style={{ color: topic.color }}>
                    {topic.strength}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Progress Ring */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
            className="rounded-2xl border border-[#E6E1DA] bg-white p-6 flex flex-col items-center justify-center"
          >
            <h3 className="text-[15px] font-semibold text-[#1C1917] mb-6">Overall Progress</h3>
            <ProgressRing value={72} />
            <div className="mt-6 grid grid-cols-2 gap-4 w-full">
              <div className="text-center">
                <p className="text-xl font-bold text-[#1C1917]">156</p>
                <p className="text-[11px] text-[#78716C]/60">Cards Reviewed</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-[#1C1917]">24</p>
                <p className="text-[11px] text-[#78716C]/60">Study Hours</p>
              </div>
            </div>
          </motion.div>

          {/* Recommended Revisions — with human reasons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
            className="lg:col-span-3 rounded-2xl border border-[#E6E1DA] bg-white p-6"
          >
            <h3 className="text-[15px] font-semibold text-[#1C1917] mb-1">What to study next</h3>
            <p className="text-[12px] text-[#78716C]/60 mb-4">Based on your learning patterns</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {revisions.map((rev, i) => (
                <motion.div
                  key={rev.topic}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.08, ease: [0.22, 0.61, 0.36, 1] }}
                  className="rounded-xl bg-[#F6F4EF] border border-[#E6E1DA] p-4 hover:border-[#F97316]/20 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${
                      rev.urgency === 'high' ? 'bg-[#F97316]' : 'bg-[#FDBA74]'
                    }`} />
                    <p className="text-[13px] font-medium text-[#1C1917]">{rev.topic}</p>
                  </div>
                  <p className="text-[11px] text-[#78716C]/60 mb-2">{rev.reason}</p>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    rev.urgency === 'high'
                      ? 'bg-[#F97316]/10 text-[#FB923C] border border-[#F97316]/15'
                      : 'bg-[#FDBA74]/10 text-[#FDBA74] border border-[#FDBA74]/15'
                  }`}>
                    {rev.due}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
