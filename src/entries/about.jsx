import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import HowItWorks from '../pages/HowItWorks.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HowItWorks />
  </StrictMode>,
)
