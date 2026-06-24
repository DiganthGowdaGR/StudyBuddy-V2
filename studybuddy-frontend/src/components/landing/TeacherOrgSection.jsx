import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function TeacherOrgSection() {
  const navigate = useNavigate()

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-transparent to-[#F9F8F6]">
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EA580C]/10 border border-[#EA580C]/20 px-4 py-2 mb-6">
              <span className="text-[12px] font-bold text-[#EA580C] uppercase tracking-widest">For Institutions</span>
            </div>
            
            <h2 className="font-display text-3xl md:text-[2.75rem] font-bold tracking-tight leading-tight text-[#1C1917] mb-6">
              Empower your teachers.<br/>
              <span className="text-[#78716C]">Elevate your classrooms.</span>
            </h2>
            
            <p className="font-serif text-[18px] text-[#57534E] leading-relaxed mb-8 italic">
              StudyBuddy isn't just for individuals. Schools and tutoring centers can create private workspaces, assign resources, and track progress across entire classrooms.
            </p>

            <ul className="space-y-4 mb-10">
              {['Create private subject codes', 'Assign AI-graded exams', 'Share resources securely'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-[#EA580C]/10 flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-[#292524] font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/organization/login')}
                className="px-6 py-3 rounded-full text-[15px] font-semibold text-white bg-[#1C1917] hover:bg-[#292524] transition-colors shadow-sm"
              >
                Organization Login
              </button>
              <button 
                onClick={() => navigate('/teacher/login')}
                className="px-6 py-3 rounded-full text-[15px] font-semibold text-[#1C1917] bg-white border border-[#E6E1DA] hover:bg-[#F5F5F4] transition-colors shadow-sm"
              >
                Teacher Portal
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative"
          >
            <div className="aspect-square max-w-[500px] mx-auto relative rounded-3xl overflow-hidden bg-gradient-to-tr from-[#EA580C]/20 to-[#FEF3C7]/40 border border-[#E6E1DA]/50 shadow-2xl p-8 flex flex-col">
              {/* Mock UI for teacher dashboard */}
              <div className="w-full h-12 bg-white/60 backdrop-blur-md rounded-2xl mb-6 flex items-center px-4 gap-3 border border-white/40">
                <div className="w-8 h-8 rounded-full bg-[#EA580C]/20 flex items-center justify-center text-[#EA580C] font-bold text-xs">CS</div>
                <div className="h-2 w-24 bg-[#78716C]/20 rounded-full"></div>
              </div>
              <div className="flex-1 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 p-6">
                <div className="h-3 w-32 bg-[#1C1917]/80 rounded-full mb-8"></div>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-full h-16 bg-white/80 rounded-xl border border-[#E6E1DA]/50 flex items-center px-4 justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#FEF3C7] border border-[#FDE68A]"></div>
                        <div>
                          <div className="h-2 w-20 bg-[#292524]/60 rounded-full mb-2"></div>
                          <div className="h-1.5 w-16 bg-[#78716C]/40 rounded-full"></div>
                        </div>
                      </div>
                      <div className="h-6 w-16 bg-[#D1FAE5] rounded-full border border-[#A7F3D0]"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#EA580C] blur-[80px] opacity-20 rounded-full pointer-events-none"></div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#FDE68A] blur-[80px] opacity-40 rounded-full pointer-events-none"></div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
