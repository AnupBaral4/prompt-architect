import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import CaseStudy from '../pages/CaseStudy.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CaseStudy />
  </StrictMode>,
)
