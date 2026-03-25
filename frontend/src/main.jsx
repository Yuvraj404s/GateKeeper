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
    primary: { main: '#38bdf8' },
    success: { main: '#34d399' },
    error:   { main: '#f87171' },
    background: { default: '#0f1923', paper: 'rgba(255,255,255,0.04)' },
    text: { primary: '#f1f5f9', secondary: '#94a3b8' },
  },
  typography: { fontFamily: 'Inter, sans-serif' },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
        containedPrimary: {
          background: '#38bdf8',
          color: '#0c1a27',
          boxShadow: 'none',
          '&:hover': { background: '#7dd3fc', boxShadow: 'none' },
          '&:disabled': { background: 'rgba(255,255,255,0.08)', color: '#475569' },
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
            '&:hover fieldset': { borderColor: 'rgba(56,189,248,0.4)' },
            '&.Mui-focused fieldset': { borderColor: '#38bdf8' },
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