// components/UI/Toast.jsx
import React from 'react'

export default function Toast({ msg, emoji = '✅' }) {
  return (
    <div className="toast">
      {emoji} {msg}
    </div>
  )
}
