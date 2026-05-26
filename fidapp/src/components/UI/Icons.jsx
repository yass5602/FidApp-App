// components/UI/Icons.jsx
// ⚠️ Dossier UI en majuscule
// Toutes les icônes : outline, stroke 1.6px
import React from 'react'

const ICONS = {
  home: (
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z M9 21V12h6v9" strokeLinecap="round" strokeLinejoin="round"/>
  ),
  scan: (
    <>
      <path d="M4 7V5a1 1 0 011-1h2M4 17v2a1 1 0 001 1h2M20 7V5a1 1 0 00-1-1h-2M20 17v2a1 1 0 01-1 1h-2" strokeLinecap="round"/>
      <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round"/>
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/>
    </>
  ),
  qr: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <path d="M14 14h2v2h-2zM18 14h3M14 18h2M18 18v3M14 21h3" strokeLinecap="round"/>
    </>
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="3"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </>
  ),
  bell: (
    <>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round"/>
      <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round"/>
    </>
  ),
  plus: (
    <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
  ),
  check: (
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
  ),
  close: (
    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
  ),
  arrow_left: (
    <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
  ),
  arrow_right: (
    <path d="M5 12h14M12 19l7-7-7-7" strokeLinecap="round" strokeLinejoin="round"/>
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="3" rx="1"/>
      <path d="M4 11v9a1 1 0 001 1h14a1 1 0 001-1v-9"/>
      <line x1="12" y1="8" x2="12" y2="21"/>
      <path d="M12 8C12 8 9 5 9 4a3 3 0 016 0c0 1-3 4-3 4z" strokeLinecap="round"/>
    </>
  ),
  star: (
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  ),
  chart: (
    <>
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
      <line x1="2"  y1="20" x2="22" y2="20"/>
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round"/>
    </>
  ),
  trash: (
    <>
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" strokeLinecap="round"/>
    </>
  ),
  send: (
    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
  ),
  camera: (
    <>
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </>
  ),
  filter: (
    <>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </>
  ),
  refresh: (
    <>
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeLinecap="round"/>
    </>
  ),
  wallet: (
    <>
      <path d="M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2z"/>
      <path d="M16 14a1 1 0 100-2 1 1 0 000 2z"/>
    </>
  ),
  map_pin: (
    <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="8" r="6"/>
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round"/>
    </>
  ),
  eye: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </>
  ),
  palette: (
    <>
      <circle cx="12" cy="12" r="10"/>
      <circle cx="8"  cy="14" r="1" fill="currentColor"/>
      <circle cx="12" cy="9"  r="1" fill="currentColor"/>
      <circle cx="16" cy="14" r="1" fill="currentColor"/>
    </>
  ),
  zap: (
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  ),
  percent: (
    <>
      <line x1="19" y1="5" x2="5" y2="19"/>
      <circle cx="6.5" cy="6.5" r="2.5"/>
      <circle cx="17.5" cy="17.5" r="2.5"/>
    </>
  ),
  shield: (
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  ),
  store: (
    <>
      <path d="M3 3h18l-2 9H5L3 3z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 12v8a1 1 0 001 1h12a1 1 0 001-1v-8"/>
      <path d="M9 12v4h6v-4"/>
    </>
  ),
}

/**
 * <Icon name="home" size={24} color="#FF5C3A" />
 */
export default function Icon({ name, size = 24, color = 'currentColor', style, className }) {
  const paths = ICONS[name]
  if (!paths) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
      aria-hidden="true"
    >
      {paths}
    </svg>
  )
}
