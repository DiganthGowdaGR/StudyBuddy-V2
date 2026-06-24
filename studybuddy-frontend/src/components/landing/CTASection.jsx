import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const lines = [
  'Not every student can afford a private tutor.',
  'Not every student has someone who explains things twice.',
  'Not every student knows what to study next.',
]

export default function CTASection() {
  const navigate = useNavigate()

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Warm cream container background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(249,115,22,0.06),transparent_60%)] blur-3xl" />
        <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(251,146,60,0.03),transparent_70%)] blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        {/* Emotional lines — Cormorant Garamond italic */}
        <div className="space-y-5 mb-10">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: i * 0.2, ease: [0.22, 0.61, 0.36, 1] }}
              className="font-serif text-[20px] md:text-[24px] italic text-[#4C3D2E]/65 font-normal leading-relaxed"
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* Mission statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <h2 className="font-display text-3xl md:text-[2.75rem] font-bold tracking-tight leading-tight text-[#1C1917]">
            Every student deserves
            <br />
            <span className="bg-gradient-to-r from-[#F97316] to-[#FB923C] bg-clip-text text-transparent">
              to understand.
            </span>
          </h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 1.0 }}
            className="mt-5 font-serif text-[18px] italic leading-relaxed text-[#78716C]"
          >
            StudyBuddy is that tutor. Patient, personal, always there.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-8"
          >
            <button
              onClick={() => navigate('/get-started')}
              className="group relative px-8 py-4 rounded-full text-[16px] font-semibold text-white bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#FB923C] hover:to-[#F97316] transition-all duration-300 shadow-[0_0_30px_rgba(249,115,22,0.25)] hover:shadow-[0_0_50px_rgba(249,115,22,0.4)] hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center gap-2">
                Begin Your Learning Journey
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </button>
          </motion.div>

          {/* Quiet note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 1.5 }}
            className="mt-6 text-[13px] text-[#78716C]/50 font-medium"
          >
            Explore Plans.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
