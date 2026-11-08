import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

  // Apply theme before React renders to prevent white flash
  ; (function applyThemeEarly() {
    const stored = localStorage.getItem('cng_pref_theme') || 'dark'
    let resolved: 'light' | 'dark' = 'dark'
    if (stored === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark'
    } else if (stored === 'light') {
      resolved = 'light'
    }
    document.documentElement.setAttribute('data-theme', resolved)
    document.documentElement.style.background = resolved === 'dark' ? '#100416' : '#FAF8F6'
  })()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
