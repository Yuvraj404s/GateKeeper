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
    primary:    { main: '#f97316' },
    success:    { main: '#22c55e' },
    error:      { main: '#ef4444' },
    warning:    { main: '#eab308' },
    background: { default: '#18181b', paper: '#27272a' },
    text:       { primary: '#e4e4e7', secondary: '#71717a' },
    divider:    'rgba(63,63,70,0.8)',
  },
  typography: { fontFamily: 'Inter, sans-serif' },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: '#27272a',
          border: '1px solid #3f3f46',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
        containedPrimary: {
          background: '#f97316', color: '#fff',
          boxShadow: 'none',
          '&:hover': { background: '#ea6d08', boxShadow: 'none' },
          '&:disabled': { background: '#3f3f46', color: '#52525b' },
        }
      }
    },
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