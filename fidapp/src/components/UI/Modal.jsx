// components/UI/Modal.jsx
import React, { useEffect } from 'react'

/**
 * Bottom sheet générique.
 * Usage:
 *   <Modal open={bool} onClose={fn} title="Mon titre">
 *     contenu
 *   </Modal>
 */
export default function Modal({ open, onClose, title, children }) {
  // Empêche le scroll du body quand la modal est ouverte
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        {title && (
          <div style={{ padding: '0 20px 16px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--text)', margin: 0 }}>
              {title}
            </h2>
          </div>
        )}
        <div style={{ padding: '16px 20px 0' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
