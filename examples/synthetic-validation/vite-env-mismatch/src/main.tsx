import React from 'react'
import { createRoot } from 'react-dom/client'

const apiUrl = import.meta.env.API_URL || process.env.API_URL

createRoot(document.getElementById('root')!).render(<div>{apiUrl}</div>)

