import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './i18n/en.json'
import ta from './i18n/ta.json'
import fr from './i18n/fr.json'

i18n.use(initReactI18next).init({
  resources: { en:{translation:en}, ta:{translation:ta}, fr:{translation:fr} },
  lng: 'en', fallbackLng: 'en', interpolation: { escapeValue: false }
})

const qc = new QueryClient()
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <App/>
        <Toaster position="top-right" toastOptions={{ style:{ background:'#162219', color:'#E8F5EE', border:'1px solid #1E3028' } }}/>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
