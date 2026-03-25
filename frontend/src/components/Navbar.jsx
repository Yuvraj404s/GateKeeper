import React from 'react'
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
    <AppBar position="fixed" elevation={0} sx={{
      background: 'rgba(13,27,42,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(168,85,247,0.2)',
      boxShadow: '0 1px 30px rgba(168,85,247,0.1)',
    }}>
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 5 }, minHeight: '68px !important' }}>

        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Box sx={{
            width: 38, height: 38, borderRadius: '10px',
            background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(168,85,247,0.5)',
          }}>
            <ShieldIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{
              fontWeight: 900, fontSize: '1.2rem', lineHeight: 1,
              background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}>
              GateKeeper
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem', letterSpacing: '0.08em' }}>
              DISTRIBUTED RATE LIMITER
            </Typography>
          </Box>
        </Box>

        {/* Nav Tabs */}
        <Box sx={{ display: 'flex', gap: 0.5, bgcolor: 'rgba(168,85,247,0.06)', borderRadius: '12px', p: 0.5, border: '1px solid rgba(168,85,247,0.12)' }}>
          {tabs.map(tab => {
            const active = location.pathname === tab.path
            return (
              <Button key={tab.path} startIcon={tab.icon} onClick={() => navigate(tab.path)}
                sx={{
                  px: 2, py: 0.8, borderRadius: '9px', fontSize: '0.85rem',
                  color: active ? '#fff' : '#94a3b8',
                  background: active ? 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(6,182,212,0.2))' : 'transparent',
                  border: active ? '1px solid rgba(168,85,247,0.4)' : '1px solid transparent',
                  boxShadow: active ? '0 0 12px rgba(168,85,247,0.2)' : 'none',
                  '&:hover': { color: '#e2e8f0', background: 'rgba(168,85,247,0.1)' },
                  transition: 'all 0.2s ease',
                }}>
                {tab.label}
              </Button>
            )
          })}
        </Box>

        {/* Live Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8,
            px: 1.5, py: 0.6, borderRadius: '20px',
            bgcolor: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.25)',
          }}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#00f5ff',
              boxShadow: '0 0 8px #00f5ff', animation: 'pulse-glow 2s infinite' }} />
            <Typography variant="caption" sx={{ color: '#00f5ff', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              LIVE
            </Typography>
          </Box>
          <Chip label="Java 21 · Spring Boot 3 · Redis" size="small"
            sx={{ bgcolor: 'rgba(168,85,247,0.08)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)', fontSize: '0.68rem', height: 24 }} />
        </Box>
      </Toolbar>
    </AppBar>
  )
}