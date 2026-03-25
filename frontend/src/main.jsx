import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App'
import './index.css'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#a855f7' },
    success: { main: '#00f5ff' },
    error: { main: '#ff4d6d' },
    warning: { main: '#ffd60a' },
    background: { default: '#0d1b2a', paper: '#0f2236' },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(168,85,247,0.15)',
          backdropFilter: 'blur(12px)',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 700, borderRadius: 10 },
        containedPrimary: {
          background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
          boxShadow: '0 0 20px rgba(168,85,247,0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #9333ea, #0891b2)',
            boxShadow: '0 0 30px rgba(168,85,247,0.55)',
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(168,85,247,0.3)' },
            '&:hover fieldset': { borderColor: 'rgba(168,85,247,0.6)' },
            '&.Mui-focused fieldset': { borderColor: '#a855f7', boxShadow: '0 0 10px rgba(168,85,247,0.2)' },
          }
        }
      }
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </BrowserRouter>
)