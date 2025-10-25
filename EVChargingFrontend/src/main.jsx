import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

// Configure dayjs globally
dayjs.extend(utc)

// Global error handler to catch unhandled errors
window.addEventListener('unhandledrejection', (event) => {
  console.log('Unhandled promise rejection:', event.reason)
  console.log('Error details:', event.reason?.response?.data)
  console.log('Error status:', event.reason?.response?.status)
  // Prevent the default behavior (which is to log the error to the console)
  event.preventDefault()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
