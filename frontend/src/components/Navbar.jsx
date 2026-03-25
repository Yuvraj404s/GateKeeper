import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Typography, Button, Chip, Divider } from '@mui/material'
import ShieldIcon from '@mui/icons-material/Shield'

const tabs = [
  { label: 'Playground', path: '/', emoji: '⚡' },
  { label: 'Analytics', path: '/analytics', emoji: '📊' },
  { label: 'How It Works', path: '/how-it-works', emoji: '📖' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1200,
      bgcolor: '#fff', borderBottom: '1px solid #e5e7eb', height: 56,
      display: 'flex', alignItems: 'center', px: 3, gap: 0 }}>

      {/* Brand */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mr: 4, cursor: 'pointer' }} onClick={() => navigate('/')}>
        <Box sx={{ width: 30, height: 30, bgcolor: '#ef6c1a', borderRadius: '7px',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldIcon sx={{ color: '#fff', fontSize: 18 }} />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#111827', letterSpacing: '-0.3px' }}>
          GateKeeper
        </Typography>
        <Chip label="API Rate Limiter" size="small"
          sx={{ bgcolor: '#fef3e8', color: '#ef6c1a', border: '1px solid #fbd5b5',
            fontSize: '0.65rem', fontWeight: 600, height: 20, borderRadius: '4px' }} />
      </Box>

      <Divider orientation="vertical" flexItem sx={{ my: 1.5, mr: 2, borderColor: '#e5e7eb' }} />

      {/* Tabs */}
      <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
        {tabs.map(tab => {
          const active = pathname === tab.path
          return (
            <Button key={tab.path} onClick={() => navigate(tab.path)}
              sx={{
                px: 2, py: 0.6, fontSize: '0.83rem', minWidth: 0,
                color: active ? '#ef6c1a' : '#6b7280',
                fontWeight: active ? 700 : 500,
                bgcolor: active ? '#fef3e8' : 'transparent',
                borderRadius: '6px',
                borderBottom: active ? '2px solid #ef6c1a' : '2px solid transparent',
                '&:hover': { bgcolor: '#f9fafb', color: '#374151' },
                transition: 'all 0.15s',
              }}>
              {tab.emoji} {tab.label}
            </Button>
          )
        })}
      </Box>

      {/* Right — stack info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {['Java 21', 'Spring Boot 3', 'Redis', 'Docker'].map(t => (
          <Typography key={t} variant="caption"
            sx={{ color: '#9ca3af', fontSize: '0.7rem', fontWeight: 500 }}>{t}</Typography>
        ))}
        <Divider orientation="vertical" flexItem sx={{ my: 1.5, borderColor: '#e5e7eb' }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6,
          bgcolor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '5px', px: 1.2, py: 0.4 }}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#22c55e' }} />
          <Typography sx={{ color: '#15803d', fontSize: '0.72rem', fontWeight: 700 }}>All services UP</Typography>
        </Box>
      </Box>
    </Box>
  )
}