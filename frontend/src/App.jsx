import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Playground from './pages/Playground'
import Analytics from './pages/Analytics'
import HowItWorks from './pages/HowItWorks'
import { Box } from '@mui/material'

export default function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0e1a' }}>
      <Navbar />
      <Box sx={{ pt: '72px' }}>
        <Routes>
          <Route path="/" element={<Playground />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
        </Routes>
      </Box>
    </Box>
  )
}