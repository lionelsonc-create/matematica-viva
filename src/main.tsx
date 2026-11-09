import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/manrope'
import '@fontsource-variable/sora'
import './index.css'
import { App } from './App'
import { AppProvider } from './lib/store'
import { ToastViewport } from './components/ui'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Elemento #root não encontrado')
}

createRoot(container).render(
  <StrictMode>
    <AppProvider>
      <App />
      <ToastViewport />
    </AppProvider>
  </StrictMode>,
)
