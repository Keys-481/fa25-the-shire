/**
 * Entry point of the React application.
 * Renders the root component <App /> inside a <StrictMode> wrapper
 * to help identify potential problems in the application.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Create a root and render the App component into the #root DOM element
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
