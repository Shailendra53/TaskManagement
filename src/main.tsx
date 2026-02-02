import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Inject AdSense script only when a client ID is provided via env
const adsenseClient = import.meta.env.VITE_ADSENSE_CLIENT
if (adsenseClient) {
  const existing = document.querySelector('script[data-adsbygoogle]')
  if (!existing) {
    const script = document.createElement('script')
    script.setAttribute('data-adsbygoogle', 'true')
    script.async = true
    script.crossOrigin = 'anonymous'
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`
    document.head.appendChild(script)
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
