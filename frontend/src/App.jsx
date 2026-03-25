import React, { useState, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Playground from './pages/Playground'
import Analytics from './pages/Analytics'
import HowItWorks from './pages/HowItWorks'
import { Box } from '@mui/material'

export default function App() {
  // Lifted state — persists across page navigation
  const [logs, setLogs] = useState([])
  const requestNum = useRef(0)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0e1a' }}>
      <Navbar />
      <Box sx={{ pt: '72px' }}>
        <Routes>
          <Route path="/" element={<Playground logs={logs} setLogs={setLogs} requestNum={requestNum} />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
        </Routes>
      </Box>
    </Box>
  )
}