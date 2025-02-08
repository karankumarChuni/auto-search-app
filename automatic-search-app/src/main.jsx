import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MyInput } from './myInput.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* <MyInput/> */}
  </StrictMode>,
)
