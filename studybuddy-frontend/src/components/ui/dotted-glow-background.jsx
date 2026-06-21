import React from 'react'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function DottedGlowBackground({
  className = '',
  opacity = 1,
  gap = 10,
  radius = 1.6,
  colorLightVar = '--color-neutral-500',
  glowColorLightVar = '--color-neutral-600',
  colorDarkVar = '--color-neutral-500',
  glowColorDarkVar = '--color-sky-800',
  backgroundOpacity = 0,
  speedMin = 0.3,
  speedMax = 1.6,
  speedScale = 1,
}) {
  const speedAvg = (Math.max(speedMin, 0.1) + Math.max(speedMax, 0.1)) / 2
  const motionScale = clamp(speedAvg * Math.max(speedScale, 0.1), 0.15, 3)
  const shiftDuration = `${(28 / motionScale).toFixed(2)}s`
  const pulseDuration = `${(18 / motionScale).toFixed(2)}s`

  const style = {
    '--dbg-gap': `${Math.max(gap, 4)}px`,
    '--dbg-radius': `${Math.max(radius, 0.8)}px`,
    '--dbg-opacity': clamp(opacity, 0, 1),
    '--dbg-bg-opacity': clamp(backgroundOpacity, 0, 1),
    '--dbg-dot-light': `var(${colorLightVar}, #737373)`,
    '--dbg-dot-dark': `var(${colorDarkVar}, #737373)`,
    '--dbg-glow-light': `var(${glowColorLightVar}, #525252)`,
    '--dbg-glow-dark': `var(${glowColorDarkVar}, #0f172a)`,
    '--dbg-shift-duration': shiftDuration,
    '--dbg-pulse-duration': pulseDuration,
  }

  return <div aria-hidden="true" className={`dotted-glow-bg ${className}`.trim()} style={style} />
}
