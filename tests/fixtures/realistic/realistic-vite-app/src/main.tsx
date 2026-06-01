import React from 'react'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root') as HTMLElement).render(
  <main>{import.meta.env.VITE_API_URL}</main>
)
