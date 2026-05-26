// components/UI/Confetti.jsx
import React, { useMemo } from 'react'

const COLORS = ['#FF5C3A', '#FFB347', '#2ECC9A', '#6366F1', '#E91E8C', '#00BCD4', '#fff']

function randomBetween(a, b) {
  return a + Math.random() * (b - a)
}

export default function Confetti() {
  const pieces = useMemo(() => (
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: randomBetween(0, 100),
      size: randomBetween(6, 13),
      color: COLORS[i % COLORS.length],
      delay: randomBetween(0, 0.8),
      duration: randomBetween(1.8, 3.2),
      rotate: randomBetween(0, 360),
      shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'square' : 'rect',
    }))
  ), [])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 999,
      overflow: 'hidden',
    }}>
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: -20,
            width: p.shape === 'rect' ? p.size * 2 : p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'square' ? 2 : 3,
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            transform: `rotate(${p.rotate}deg)`,
            opacity: 0.92,
          }}
        />
      ))}
    </div>
  )
}
