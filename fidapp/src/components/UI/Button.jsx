// components/UI/Button.jsx
import React from 'react'

/**
 * Bouton unifié.
 * variant: 'primary' | 'outline' | 'navy' | 'mint' | 'danger' | 'ghost'
 * size: 'sm' | 'md' | 'lg'
 */
export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = true,
  style,
  icon,
}) {
  const sizeStyles = {
    sm: { padding: '9px 14px', fontSize: 13, borderRadius: 10 },
    md: { padding: '13px 18px', fontSize: 15, borderRadius: 12 },
    lg: { padding: '15px 22px', fontSize: 16, borderRadius: 14 },
  }
  return (
    <button
      className={`btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: fullWidth ? '100%' : 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...sizeStyles[size],
        ...style,
      }}
    >
      {icon && icon}
      {children}
    </button>
  )
}
