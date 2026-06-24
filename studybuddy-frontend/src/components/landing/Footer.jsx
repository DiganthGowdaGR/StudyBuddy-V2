import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const footerLinks = {
  Learn: ['Smart Notes', 'AI Tutor', 'Flashcards', 'Voice Learning', 'Study Planner'],
  Resources: ['How It Works', 'Getting Started', 'Help Center'],
  Company: ['About', 'Privacy', 'Terms'],
}

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="relative bg-gradient-to-br from-[#EA580C] via-[#F97316] to-[#FB923C] overflow-hidden">
      {/* Decorative texture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(255,255,255,0.06),transparent_60%)] blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(0,0,0,0.08),transparent_60%)] blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-grid)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <a href="/" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-[0_0_16px_rgba(255,255,255,0.15)] group-hover:bg-white/30 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <span className="font-display text-[17px] font-bold tracking-tight text-white">StudyBuddy</span>
            </a>
            <p className="mt-4 font-serif italic text-[14px] leading-relaxed text-white/75 max-w-xs">
              Your AI learning companion. Because every student deserves a tutor who never gives up on them.
            </p>

            {/* Trust badge */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-[#fde047] animate-pulse" />
              <span className="text-[12px] font-semibold text-white tracking-wide">Explore Plans</span>
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[11px] font-bold tracking-[0.18em] text-white/60 uppercase mb-5">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[13px] text-white/80 hover:text-white transition-colors duration-200 hover:translate-x-0.5 inline-block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-white/60">
            © {new Date().getFullYear()} StudyBuddy — Built for students, by people who remember what exams feel like.
          </p>
          <div className="flex items-center gap-5">
            {/* Social links removed */}
          </div>
        </div>
      </div>
    </footer>
  )
}
