import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppBar, Toolbar, Box, Button, Chip, Typography } from '@mui/material'
import ShieldIcon from '@mui/icons-material/Shield'
import ScienceIcon from '@mui/icons-material/Science'
import BarChartIcon from '@mui/icons-material/BarChart'
import MenuBookIcon from '@mui/icons-material/MenuBook'

const tabs = [
  { label: 'Playground', path: '/', icon: <ScienceIcon fontSize="small" /> },
  { label: 'Analytics', path: '/analytics', icon: <BarChartIcon fontSize="small" /> },
  { label: 'How It Works', path: '/how-it-works', icon: <MenuBookIcon fontSize="small" /> },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <AppBar position="fixed" sx={{ bgcolor: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1f2937', boxShadow: 'none' }}>
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ShieldIcon sx={{ color: '#6366f1', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            GateKeeper
          </Typography>
          <Chip label="v1.0.0" size="small" sx={{ bgcolor: '#1f2937', color: '#9ca3af', fontSize: '0.7rem', height: 20 }} />
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {tabs.map(tab => (
            <Button
              key={tab.path}
              startIcon={tab.icon}
              onClick={() => navigate(tab.path)}
              sx={{
                color: location.pathname === tab.path ? '#6366f1' : '#9ca3af',
                bgcolor: location.pathname === tab.path ? 'rgba(99,102,241,0.1)' : 'transparent',
                px: 2,
                '&:hover': { bgcolor: 'rgba(99,102,241,0.08)', color: '#a5b4fc' }
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>

        <Chip
          label="🟢 Live"
          size="small"
          sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 700 }}
        />
      </Toolbar>
    </AppBar>
  )
}