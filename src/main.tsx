import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css";
import "./form.css";
import "./detail.css";
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
