import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || mobileMenuOpen
          ? 'bg-[#FCFBF8]/95 backdrop-blur-xl border-b border-[#E6E1DA] shadow-[0_1px_20px_rgba(0,0,0,0.06)]'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center shadow-[0_0_16px_rgba(249,115,22,0.2)] group-hover:shadow-[0_0_24px_rgba(249,115,22,0.35)] transition-shadow duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
            </div>
            <span className="font-display text-[17px] font-bold tracking-tight text-[#1C1917]">
              StudyBuddy
            </span>
          </a>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {['How It Works', 'AI Tutor', 'Your Progress'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-[13px] font-semibold text-[#44403C] hover:text-[#F97316] hover:scale-105 transition-all duration-200"
              >
                {item}
              </a>
            ))}
          </div>

          {/* CTA & Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/get-started')}
              className="hidden sm:inline-block relative group px-5 py-2 rounded-full text-[13px] font-semibold text-white bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#FB923C] hover:to-[#F97316] transition-all duration-300 shadow-[0_0_16px_rgba(249,115,22,0.2)] hover:shadow-[0_0_24px_rgba(249,115,22,0.35)] cursor-pointer"
            >
              Start Learning
            </button>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center p-2 rounded-xl text-[#44403C] hover:bg-[#E6E1DA]/40 transition-colors duration-200 cursor-pointer"
              aria-label="Toggle Menu"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {mobileMenuOpen ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <path d="M4 12h16M4 6h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden bg-[#FCFBF8] border-b border-[#E6E1DA] shadow-lg overflow-hidden"
          >
            <div className="px-6 py-4 space-y-3 flex flex-col">
              {['How It Works', 'AI Tutor', 'Your Progress'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[14px] font-semibold text-[#44403C] hover:text-[#F97316] py-2 border-b border-[#E6E1DA]/40 last:border-b-0 transition-colors duration-200"
                >
                  {item}
                </a>
              ))}
              <div className="pt-3 border-t border-[#E6E1DA]/60">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate('/get-started')
                  }}
                  className="w-full text-center py-2.5 rounded-full text-[13px] font-semibold text-white bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#FB923C] hover:to-[#F97316] shadow-[0_0_16px_rgba(249,115,22,0.2)] cursor-pointer"
                >
                  Start Learning
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

