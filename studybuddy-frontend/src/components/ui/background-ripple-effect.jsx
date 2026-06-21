import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

function indexToPoint(index, cols) {
  return {
    row: Math.floor(index / cols),
    col: index % cols,
  }
}

export function BackgroundRippleEffect({ className = '', rows = 16, cols = 30 }) {
  const total = rows * cols
  const cells = useMemo(() => Array.from({ length: total }, (_, i) => i), [total])
  const [originIndex, setOriginIndex] = useState(-1)
  const [rippling, setRippling] = useState(false)
  const rippleTimeoutRef = useRef(null)

  const triggerRipple = useCallback((index) => {
    if (index < 0 || index >= total) return

    setOriginIndex(index)
    setRippling(false)

    window.requestAnimationFrame(() => {
      setRippling(true)
    })

    if (rippleTimeoutRef.current) {
      window.clearTimeout(rippleTimeoutRef.current)
    }

    rippleTimeoutRef.current = window.setTimeout(() => {
      setRippling(false)
    }, 950)
  }, [total])

  useEffect(() => {
    return () => {
      if (rippleTimeoutRef.current) {
        window.clearTimeout(rippleTimeoutRef.current)
      }
    }
  }, [])

  const origin = originIndex >= 0 ? indexToPoint(originIndex, cols) : { row: 0, col: 0 }

  return (
    <div
      className={`bg-ripple-effect ${className}`.trim()}
      style={{ '--ripple-cols': cols, '--ripple-rows': rows }}
      aria-hidden="true"
    >
      {cells.map((index) => {
        const point = indexToPoint(index, cols)
        const distance = Math.hypot(point.row - origin.row, point.col - origin.col)
        const delay = `${Math.min(distance * 18, 520).toFixed(0)}ms`

        return (
          <div
            key={index}
            className={`bg-ripple-cell ${rippling ? 'bg-ripple-cell--active' : ''}`}
            style={{ '--ripple-delay': delay }}
            onMouseEnter={() => triggerRipple(index)}
            onClick={() => triggerRipple(index)}
          />
        )
      })}
    </div>
  )
}
