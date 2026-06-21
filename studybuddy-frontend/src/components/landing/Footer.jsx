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
              <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span className="text-[12px] font-semibold text-white tracking-wide">Free for students, always</span>
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
            {/* GitHub */}
            <a href="#" className="text-white/50 hover:text-white transition-colors" aria-label="GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            {/* Twitter/X */}
            <a href="#" className="text-white/50 hover:text-white transition-colors" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
