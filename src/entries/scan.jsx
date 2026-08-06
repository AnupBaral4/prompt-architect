import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import Scan from '../pages/Scan.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Scan />
  </StrictMode>,
)
