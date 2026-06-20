import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/authContext.jsx'; // Add this import
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider> {/* Add opening tag */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider> {/* Add closing tag */}
  </StrictMode>
)
