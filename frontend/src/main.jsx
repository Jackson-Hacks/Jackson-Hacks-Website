import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { initializeOperationalMonitoring } from '@/lib/operationalMonitoring'

initializeOperationalMonitoring()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
