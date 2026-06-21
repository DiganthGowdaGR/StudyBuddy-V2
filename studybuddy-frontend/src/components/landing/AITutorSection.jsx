import React from 'react'
import { motion } from 'framer-motion'

const narrative = [
  {
    stage: 'confused',
    label: 'The struggle',
    emoji: '😕',
    studentText: "I've read this 5 times and I still don't get integration by parts...",
    color: '#EF4444',
    bgColor: 'rgba(239,68,68,0.06)',
    borderColor: 'rgba(239,68,68,0.12)',
  },
  {
    stage: 'guided',
    label: 'The guidance',
    emoji: '💡',
    aiText: "Think of it differently — integration by parts is just the product rule, running backwards. From your Week 3 notes, you already understand the product rule. Let's build on that...",
    source: 'Calculus II — Week 3 Notes',
    color: '#F97316',
    bgColor: 'rgba(249,115,22,0.06)',
    borderColor: 'rgba(249,115,22,0.12)',
  },
  {
    stage: 'understood',
    label: 'The click',
    emoji: '✨',
    studentText: "Oh wait — so if I just identify u and dv first, the rest follows the pattern I already know!",
    color: '#34D399',
    bgColor: 'rgba(52,211,153,0.06)',
    borderColor: 'rgba(52,211,153,0.12)',
  },
]

const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: i * 0.25,
      ease: [0.22, 0.61, 0.36, 1],
    },
  }),
}

export default function AITutorSection() {
  return (
    <section id="ai-tutor" className="relative py-12 md:py-16 overflow-hidden">
      {/* Accent glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(249,115,22,0.04),transparent_70%)] blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Narrative Visual — left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative rounded-2xl border border-[#E6E1DA] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.07)] overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E6E1DA]">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#F97316] to-[#FB923C] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                   <p className="text-[13px] font-semibold text-[#1C1917]">Your AI Tutor</p>
                   <p className="text-[11px] text-[#78716C]/60">Understands your notes, your gaps, your pace</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[#34D399] animate-pulse" />
                  <span className="text-[11px] text-[#34D399]/70">Always here</span>
                </div>
              </div>

              {/* Narrative Messages */}
              <div className="p-5 space-y-4">
                {narrative.map((msg, i) => (
                  <motion.div
                    key={msg.stage}
                    custom={i}
                    variants={messageVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {/* Stage label */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[16px]">{msg.emoji}</span>
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                        style={{ color: msg.color, borderColor: msg.borderColor, backgroundColor: msg.bgColor }}
                      >
                        {msg.label}
                      </span>
                    </div>

                    {/* Message bubble */}
                    <div
                      className="rounded-2xl px-4 py-3 border"
                      style={{ borderColor: msg.borderColor, backgroundColor: msg.bgColor }}
                    >
                       <p className="text-[13px] leading-relaxed text-[#292524]/80">
                        {msg.studentText || msg.aiText}
                      </p>
                      {msg.source && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span className="text-[10px] font-medium text-[#FB923C]/60">{msg.source}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input bar */}
              <div className="px-5 py-3 border-t border-[#E6E1DA]">
                 <div className="flex items-center gap-3 rounded-xl bg-[#F6F4EF] border border-[#E6E1DA] px-4 py-2.5">
                   <span className="text-[13px] text-[#78716C]/50 flex-1">Ask about anything you&apos;re studying...</span>
                  <div className="h-7 w-7 rounded-lg bg-[#F97316] flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text side — right */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
            className="order-1 lg:order-2"
          >
            <span className="text-[12px] font-semibold tracking-[0.2em] text-[#F97316] uppercase">
              AI Tutor
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-[2.5rem] font-bold tracking-tight text-[#1C1917] leading-tight">
              From confusion
              <br />
              <span className="bg-gradient-to-r from-[#F97316] to-[#FB923C] bg-clip-text text-transparent">
                to clarity.
              </span>
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-[#78716C] max-w-md">
              It&apos;s 2 AM. You&apos;re stuck. You&apos;ve read the textbook three times.
              StudyBuddy doesn&apos;t just give you answers — it helps you 
              <em className="text-[#292524] not-italic font-medium"> actually understand</em>,
              using your own notes as the foundation.
            </p>

            <div className="mt-8 space-y-5">
              {[
                {
                  title: 'Reads your notes first',
                  desc: 'Every answer is grounded in what you\'ve already studied.',
                },
                {
                  title: 'Explains, not just answers',
                  desc: 'Builds understanding step by step, at your pace.',
                },
                {
                  title: 'Remembers your weak spots',
                  desc: 'Focuses extra attention where you need it most.',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: [0.22, 0.61, 0.36, 1] }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-[#F97316]/10 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#1C1917]">{item.title}</p>
                     <p className="text-[13px] text-[#78716C] mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
