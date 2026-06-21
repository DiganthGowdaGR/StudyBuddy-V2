import React from 'react'

export function Spotlight({ className = '', fill = 'white' }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute ${className}`.trim()}>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(165deg, rgba(255,255,255,0) 28%, ${fill} 48%, rgba(255,255,255,0) 72%)`,
          filter: 'blur(62px)',
          opacity: 0.28,
          transform: 'rotate(8deg) scale(1.08)',
          transformOrigin: 'top left',
        }}
      />
      <div
        className="absolute -top-12 left-16 h-44 w-44 rounded-full"
        style={{
          background: fill,
          filter: 'blur(70px)',
          opacity: 0.24,
        }}
      />
    </div>
  )
}
