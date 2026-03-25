import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Typography, Button, Chip } from '@mui/material'
import ShieldIcon from '@mui/icons-material/Shield'

const tabs = [
  { label:'Playground', path:'/', icon:'⚡' },
  { label:'Analytics',  path:'/analytics', icon:'📊' },
  { label:'How It Works', path:'/how-it-works', icon:'📖' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  return (
    <Box sx={{
      position:'fixed', top:0, left:0, right:0, zIndex:1200, height:60,
      background:'rgba(15,25,35,0.85)', backdropFilter:'blur(20px)',
      borderBottom:'1px solid rgba(255,255,255,0.07)',
      display:'flex', alignItems:'center', px:4, gap:2,
    }}>
      <Box sx={{ display:'flex', alignItems:'center', gap:1.2, cursor:'pointer', mr:2 }} onClick={()=>navigate('/')}>
        <Box sx={{ width:32, height:32, background:'linear-gradient(135deg,#38bdf8,#34d399)',
          borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <ShieldIcon sx={{ color:'#0c1a27', fontSize:18 }} />
        </Box>
        <Typography sx={{ fontWeight:800, fontSize:'1rem', color:'#f1f5f9', letterSpacing:'-0.3px' }}>GateKeeper</Typography>
        <Typography sx={{ fontSize:'0.7rem', color:'#475569' }}>/ Rate Limiter</Typography>
      </Box>

      {tabs.map(tab => {
        const active = pathname === tab.path
        return (
          <Button key={tab.path} onClick={()=>navigate(tab.path)} sx={{
            px:2, py:0.7, fontSize:'0.83rem', borderRadius:'8px',
            color: active ? '#38bdf8' : '#64748b',
            bgcolor: active ? 'rgba(56,189,248,0.1)' : 'transparent',
            border: active ? '1px solid rgba(56,189,248,0.2)' : '1px solid transparent',
            fontWeight: active ? 700 : 500,
            '&:hover':{ bgcolor:'rgba(255,255,255,0.05)', color:'#cbd5e1' },
            transition:'all 0.15s',
          }}>
            {tab.icon} {tab.label}
          </Button>
        )
      })}

      <Box sx={{ flex:1 }} />
      {['Java 21','Spring Boot 3','Redis','Docker'].map(t=>(
        <Typography key={t} sx={{ color:'#334155', fontSize:'0.7rem' }}>{t}</Typography>
      ))}
      <Box sx={{ display:'flex', alignItems:'center', gap:0.7,
        bgcolor:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)',
        borderRadius:'6px', px:1.5, py:0.5 }}>
        <Box sx={{ width:7, height:7, borderRadius:'50%', bgcolor:'#34d399' }} />
        <Typography sx={{ color:'#34d399', fontSize:'0.72rem', fontWeight:700 }}>All services UP</Typography>
      </Box>
    </Box>
  )
}