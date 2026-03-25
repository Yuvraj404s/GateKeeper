import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Typography, Button } from '@mui/material'
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
    <Box sx={{ position:'fixed', top:0, left:0, right:0, zIndex:1200,
      height:56, bgcolor:'#1c1c1f', borderBottom:'1px solid #3f3f46',
      display:'flex', alignItems:'center', px:4, gap:2 }}>

      <Box sx={{ display:'flex', alignItems:'center', gap:1.2, cursor:'pointer', mr:2 }}
        onClick={()=>navigate('/')}>
        <Box sx={{ width:30, height:30, bgcolor:'#f97316', borderRadius:'7px',
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <ShieldIcon sx={{ color:'#fff', fontSize:17 }} />
        </Box>
        <Typography sx={{ fontWeight:800, fontSize:'0.95rem', color:'#e4e4e7', letterSpacing:'-0.3px' }}>
          GateKeeper
        </Typography>
        <Typography sx={{ fontSize:'0.68rem', color:'#52525b' }}>Rate Limiter</Typography>
      </Box>

      {tabs.map(tab => {
        const active = pathname === tab.path
        return (
          <Button key={tab.path} onClick={()=>navigate(tab.path)} sx={{
            px:1.8, py:0.6, fontSize:'0.82rem', borderRadius:'7px',
            color: active ? '#f97316' : '#71717a',
            bgcolor: active ? 'rgba(249,115,22,0.1)' : 'transparent',
            fontWeight: active ? 700 : 500,
            borderBottom: active ? '2px solid #f97316' : '2px solid transparent',
            '&:hover': { bgcolor:'#27272a', color:'#d4d4d8' },
            transition: 'all 0.15s',
          }}>
            {tab.icon} {tab.label}
          </Button>
        )
      })}

      <Box sx={{ flex:1 }} />
      {['Java 21','Spring Boot 3','Redis','Docker'].map(t=>(
        <Typography key={t} sx={{ color:'#3f3f46', fontSize:'0.7rem' }}>{t}</Typography>
      ))}
      <Box sx={{ display:'flex', alignItems:'center', gap:0.7, ml:1,
        bgcolor:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)',
        borderRadius:'5px', px:1.2, py:0.4 }}>
        <Box sx={{ width:6, height:6, borderRadius:'50%', bgcolor:'#22c55e' }} />
        <Typography sx={{ color:'#86efac', fontSize:'0.7rem', fontWeight:700 }}>All services UP</Typography>
      </Box>
    </Box>
  )
}