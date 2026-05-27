import '@/app/styles/global.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

if (typeof window !== 'undefined') {
  window.localStorage.removeItem('product-feedback')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
