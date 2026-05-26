// components/QRSvg.jsx — adapté depuis fidelia-ui.jsx
import React from 'react'

/**
 * Rendu SVG d'un QR code statique décoratif.
 * En prod, remplacer par un vrai QR code généré depuis le token JWT.
 */
export default function QRSvg({ size = 180, color = '#1B2340' }) {
  const blocks = [
    [0,0,7,7],[1,1,5,5,'bg'],[2,2,3,3],
    [14,0,7,7],[15,1,5,5,'bg'],[16,2,3,3],
    [0,14,7,7],[1,15,5,5,'bg'],[2,16,3,3],
    [9,0,1,1],[11,0,1,1],[9,2,2,1],[12,2,1,1],[8,3,1,2],[10,3,1,1],[12,3,2,1],
    [7,7,1,1],[9,7,2,1],[12,7,1,2],[14,7,1,1],[7,9,1,2],[9,9,1,1],[11,9,2,1],
    [8,11,2,1],[11,11,1,2],[13,11,1,1],[7,12,1,1],[9,12,2,1],[12,12,2,1],
    [7,14,1,1],[9,14,2,2],[12,14,1,1],[14,14,2,2],[8,16,1,1],[11,16,2,1],[14,16,2,1],
    [7,18,1,1],[9,18,1,1],[11,18,2,1],[14,18,1,1],[8,20,3,1],
  ]
  const u = size / 21
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {blocks.map(([x, y, w, h, type], i) => (
        <rect
          key={i}
          x={x * u} y={y * u}
          width={w * u} height={h * u}
          rx={type === 'bg' ? u * 0.5 : 0}
          fill={type === 'bg' ? 'transparent' : color}
        />
      ))}
    </svg>
  )
}
