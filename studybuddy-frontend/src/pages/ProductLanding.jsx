import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/landing/Navbar'
import HeroSection from '../components/landing/HeroSection'
import FeaturesGrid from '../components/landing/FeaturesGrid'
import NotebookSection from '../components/landing/NotebookSection'
import AITutorSection from '../components/landing/AITutorSection'
import AdaptiveLearningSection from '../components/landing/AdaptiveLearningSection'
import CTASection from '../components/landing/CTASection'
import TeacherOrgSection from '../components/landing/TeacherOrgSection'
import Footer from '../components/landing/Footer'

/* 
 * Emotional transition beat — sits between sections to add
 * storytelling context and break the section-section-section monotony.
 */
function StoryBeat({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
      className={`mx-auto max-w-3xl px-6 py-8 md:py-12 text-center ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default function ProductLanding() {
  useEffect(() => {
    document.title = 'StudyBuddy — Your AI Learning Companion'
  }, [])

  return (
    <div className="relative min-h-screen bg-[#FCFBF8] text-[#292524] antialiased selection:bg-[#F97316]/20 selection:text-[#1C1917]">
      {/* Subtle warm grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Premium ambient decorative orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] left-[5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#FED7AA]/40 via-[#FFEAD6]/20 to-transparent blur-[120px] opacity-75 animate-float-slow" />
        <div className="absolute top-[25%] -right-[10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-[#FEF3C7]/50 via-[#FDE68A]/15 to-transparent blur-[140px] opacity-80 animate-float-medium" />
        <div className="absolute bottom-[20%] -left-[15%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[#FEE2E2]/40 via-[#FECACA]/15 to-transparent blur-[160px] opacity-70 animate-float-fast" />
        {/* Additional accent orb for rich modern depth */}
        <div className="absolute top-[60%] left-[30%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-[#FFF7ED] via-[#FFEDD5]/30 to-transparent blur-[110px] opacity-60 animate-float-slow" style={{ animationDelay: '-12s' }} />
      </div>

      <Navbar />

      <main className="relative z-10">
        <HeroSection />

        {/* --- Emotional beat: The problem --- */}
        <StoryBeat>
          <p className="font-serif text-[22px] md:text-[28px] italic font-medium leading-relaxed text-[#57534E]">
            You&apos;ve got <span className="text-[#1C1917] font-semibold border-b border-[#F97316]/30">50 PDFs</span>, notes in{' '}
            <span className="text-[#1C1917] font-semibold border-b border-[#F97316]/30">4 different apps</span>, and the exam is in{' '}
            <span className="text-[#EA580C] not-italic font-bold">3 days</span>.
          </p>
          <p className="mt-4 font-serif text-[17px] italic text-[#78716C]">
            Sound familiar? You&apos;re not alone.
          </p>
        </StoryBeat>

        {/* Warm divider */}
        <div className="mx-auto max-w-6xl px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-[#E6E1DA] to-transparent" />
        </div>

        <div className="relative">
          <FeaturesGrid />
        </div>

        {/* --- Emotional beat: Transition to notebook --- */}
        <StoryBeat>
          <p className="font-serif text-[22px] md:text-[28px] italic font-medium leading-relaxed text-[#57534E]">
            What if every note you ever took{' '}
            <span className="text-[#1C1917] font-semibold border-b border-[#F97316]/30">remembered itself</span> — and helped you{' '}
            <span className="text-[#EA580C] not-italic font-bold">study smarter</span>?
          </p>
        </StoryBeat>

        <div className="mx-auto max-w-6xl px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-[#E6E1DA] to-transparent" />
        </div>

        <div className="relative">
          <NotebookSection />
        </div>

        {/* --- Emotional beat: Transition to AI tutor --- */}
        <StoryBeat>
          <p className="font-serif text-[22px] md:text-[28px] italic font-medium leading-relaxed text-[#57534E]">
            Everyone gets stuck.{' '}
            <span className="text-[#1C1917] font-semibold border-b border-[#F97316]/30">The difference is having someone</span> who helps you{' '}
            <span className="text-[#EA580C] not-italic font-bold">get unstuck</span>.
          </p>
        </StoryBeat>

        <div className="mx-auto max-w-6xl px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-[#E6E1DA] to-transparent" />
        </div>

        <div className="relative">
          <AITutorSection />
        </div>

        {/* --- Emotional beat: Transition to progress --- */}
        <StoryBeat>
          <p className="font-serif text-[22px] md:text-[28px] italic font-medium leading-relaxed text-[#57534E]">
            The hardest part of studying isn&apos;t learning.{' '}
            <span className="text-[#1C1917] font-semibold border-b border-[#F97316]/30">It&apos;s knowing</span>{' '}
            <span className="text-[#EA580C] not-italic font-bold">what to study next</span>.
          </p>
        </StoryBeat>

        <div className="mx-auto max-w-6xl px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-[#E6E1DA] to-transparent" />
        </div>

        <div className="relative">
          <AdaptiveLearningSection />
        </div>

        {/* --- Emotional beat: Final CTA transition --- */}
        <StoryBeat>
          <p className="font-serif text-[22px] md:text-[28px] italic font-medium leading-relaxed text-[#57534E]">
            And it's not just for students. StudyBuddy brings{' '}
            <span className="text-[#1C1917] font-semibold border-b border-[#F97316]/30">teachers and students</span> together in one{' '}
            <span className="text-[#EA580C] not-italic font-bold">seamless platform</span>.
          </p>
        </StoryBeat>

        <div className="mx-auto max-w-6xl px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-[#E6E1DA] to-transparent" />
        </div>

        <div className="relative">
          <TeacherOrgSection />
        </div>

        {/* --- Final warm divider before emotional close --- */}
        <div className="mx-auto max-w-6xl px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-[#E6E1DA] to-transparent" />
        </div>

        <div className="relative">
          <CTASection />
        </div>
      </main>

      <Footer />
    </div>
  )
}
