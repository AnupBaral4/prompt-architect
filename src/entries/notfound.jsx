import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import NotFound from '../pages/NotFound.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotFound />
  </StrictMode>,
)
