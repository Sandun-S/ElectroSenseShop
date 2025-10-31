import React from 'react'
import ReactDOM from 'react-dom/client'
// --- FIX: Use root-relative paths ---
import App from '/src/App.jsx'
import '/src/index.css' 
import { BrowserRouter } from 'react-router-dom'
// --- FIX: Use root-relative paths ---
import ScrollToTop from '/src/components/ScrollToTop.jsx' // <-- 1. Import it

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop /> {/* <-- 2. Add it here */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

