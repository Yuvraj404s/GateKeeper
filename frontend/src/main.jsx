import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App'
import './index.css'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary:    { main: '#ef6c1a' },
    success:    { main: '#1a7f4b' },
    error:      { main: '#c0392b' },
    warning:    { main: '#d97706' },
    background: { default: '#f3f4f6', paper: '#ffffff' },
    text:       { primary: '#111827', secondary: '#6b7280' },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)' }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 6 },
        containedPrimary: {
          background: '#ef6c1a',
          boxShadow: 'none',
          '&:hover': { background: '#d45f15', boxShadow: 'none' }
        }
      }
    },
    MuiAppBar: { styleOverrides: { root: { boxShadow: 'none' } } }
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