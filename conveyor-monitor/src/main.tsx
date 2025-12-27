import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Tambahkan class dark ke elemen HTML
document.documentElement.classList.add('dark')

// Tambahkan class bg-background ke body
document.body.classList.add('bg-background', 'text-foreground')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)