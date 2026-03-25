import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Typography, Button, Chip } from '@mui/material'
import ShieldIcon from '@mui/icons-material/Shield'

const tabs = [
  { label: 'Playground', path: '/', icon: '⚡' },
  { label: 'Analytics',  path: '/analytics', icon: '📊' },
  { label: 'How It Works', path: '/how-it-works', icon: '📖' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  return (
    <Box sx={{ position:'fixed', top:0, left:0, right:0, zIndex:1200,
      height:60, bgcolor:'#fff', borderBottom:'1px solid #e2e8f0',
      display:'flex', alignItems:'center', px:4, gap:3 }}>

      <Box sx={{ display:'flex', alignItems:'center', gap:1.2, cursor:'pointer', mr:2 }} onClick={()=>navigate('/')}>
        <Box sx={{ width:32, height:32, bgcolor:'#7c3aed', borderRadius:'8px',
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <ShieldIcon sx={{ color:'#fff', fontSize:18 }} />
        </Box>
        <Typography sx={{ fontWeight:800, fontSize:'1rem', color:'#0f172a', letterSpacing:'-0.4px' }}>GateKeeper</Typography>
        <Typography sx={{ fontSize:'0.7rem', color:'#94a3b8', fontWeight:500 }}>Rate Limiter</Typography>
      </Box>

      {tabs.map(tab => {
        const active = pathname === tab.path
        return (
          <Button key={tab.path} onClick={() => navigate(tab.path)}
            sx={{ px:2, py:0.7, fontSize:'0.83rem', borderRadius:'7px',
              color: active ? '#7c3aed' : '#64748b',
              bgcolor: active ? '#f5f3ff' : 'transparent',
              fontWeight: active ? 700 : 500,
              borderBottom: active ? '2px solid #7c3aed' : '2px solid transparent',
              '&:hover':{ bgcolor:'#f8fafc', color:'#0f172a' } }}>
            {tab.icon} {tab.label}
          </Button>
        )
      })}

      <Box sx={{ flex:1 }} />
      <Box sx={{ display:'flex', alignItems:'center', gap:0.8,
        bgcolor:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'6px', px:1.5, py:0.5 }}>
        <Box sx={{ width:7, height:7, borderRadius:'50%', bgcolor:'#22c55e' }} />
        <Typography sx={{ color:'#166534', fontSize:'0.72rem', fontWeight:700 }}>8 services running</Typography>
      </Box>
    </Box>
  )
}