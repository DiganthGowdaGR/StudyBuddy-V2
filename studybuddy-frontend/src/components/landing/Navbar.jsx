import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { name: 'How It Works', id: 'how-it-works' },
  { name: 'AI Tutor', id: 'ai-tutor' },
  { name: 'Your Progress', id: 'your-progress' },
]

export default function Navbar({ onStartLearningClick, onWaitlistClick }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [hoveredItem, setHoveredItem] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0.1,
    }

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)
    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
      className={`sticky top-0 z-50 transition-all duration-300 px-4 sm:px-6 md:px-8 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div
        className={`mx-auto max-w-5xl rounded-2xl md:rounded-full border transition-all duration-300 px-6 py-2.5 md:py-2 bg-[#FCFBF8]/80 backdrop-blur-md ${
          scrolled
            ? 'shadow-[0_12px_30px_rgba(0,0,0,0.06)] border-[#D4CDBF]/70 bg-[#FCFBF8]/95'
            : 'shadow-[0_4px_20px_rgba(0,0,0,0.02)] border-[#E6E1DA]/80'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center shadow-[0_0_16px_rgba(249,115,22,0.2)] group-hover:shadow-[0_0_24px_rgba(249,115,22,0.35)] group-hover:scale-105 transition-all duration-300">
                <svg className="group-hover:rotate-12 transition-transform duration-300" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
            </div>
            <span className="font-display text-[17px] font-bold tracking-tight text-[#1C1917] group-hover:text-[#EA580C] transition-colors duration-300">
              StudyBuddy
            </span>
          </a>

          {/* Nav Links - Desktop (Pill design with sliding glass active indicator) */}
          <div className="hidden md:flex items-center gap-1 bg-[#E6E1DA]/30 p-1 rounded-full border border-[#E6E1DA]/40 relative">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id
              const isHovered = hoveredItem === item.id
              const isSelected = isHovered || (hoveredItem === null && isActive)

              return (
                <a
                  key={item.name}
                  href={`#${item.id}`}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors duration-300 relative z-10 ${
                    isSelected ? 'text-[#EA580C]' : 'text-[#44403C] hover:text-[#EA580C]'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="navbar-active-pill"
                      className="absolute inset-0 bg-[#FCFBF8] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E6E1DA]/50"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      style={{ originY: '0px' }}
                    />
                  )}
                  <span className="relative z-20">{item.name}</span>
                </a>
              )
            })}
          </div>

          {/* CTA & Hamburger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onStartLearningClick || (() => navigate('/get-started'))}
              className="hidden sm:inline-block relative group px-5 py-2 rounded-full text-[13px] font-semibold sb-glass-shimmer-orange cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
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

      {/* Mobile Menu Panel (Floating dropdown with staggered animations) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-4 right-4 mt-2 md:hidden bg-[#FCFBF8]/95 backdrop-blur-xl border border-[#E6E1DA] shadow-xl rounded-2xl overflow-hidden z-50"
          >
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
                closed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } }
              }}
              className="px-6 py-5 space-y-3 flex flex-col"
            >
              {NAV_ITEMS.map((item) => (
                <motion.a
                  key={item.name}
                  href={`#${item.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  variants={{
                    open: { opacity: 1, y: 0 },
                    closed: { opacity: 0, y: -8 }
                  }}
                  transition={{ duration: 0.2 }}
                  className={`text-[14px] font-semibold py-2 border-b border-[#E6E1DA]/40 last:border-b-0 transition-colors duration-200 ${
                    activeSection === item.id ? 'text-[#EA580C]' : 'text-[#44403C] hover:text-[#EA580C]'
                  }`}
                >
                  {item.name}
                </motion.a>
              ))}
              <motion.div
                variants={{
                  open: { opacity: 1, y: 0 },
                  closed: { opacity: 0, y: -8 }
                }}
                transition={{ duration: 0.2 }}
                className="pt-3 border-t border-[#E6E1DA]/60"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    if (onStartLearningClick) {
                      onStartLearningClick()
                    } else {
                      navigate('/get-started')
                    }
                  }}
                  className="w-full text-center py-2.5 rounded-full text-[13px] font-semibold sb-glass-shimmer-orange cursor-pointer"
                >
                  Start Learning
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

