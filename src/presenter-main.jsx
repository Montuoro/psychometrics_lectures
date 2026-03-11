import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PresenterView from './PresenterView.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PresenterView />
  </StrictMode>,
)
