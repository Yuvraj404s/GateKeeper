import React, { useState, useEffect } from 'react'
import { Box, Container, Grid, Typography, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, IconButton, Tooltip } from '@mui/material'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import RefreshIcon from '@mui/icons-material/Refresh'
import axios from 'axios'
import { motion } from 'framer-motion'

const glass = {
  background:'rgba(255,255,255,0.04)',
  backdropFilter:'blur(20px)',
  border:'1px solid rgba(255,255,255,0.08)',
  borderRadius:'12px',
  boxShadow:'0 4px 24px rgba(0,0,0,0.3)',
}
const tt = { contentStyle:{ background:'#111c2b', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#f1f5f9', fontSize:'0.8rem' } }

function Metric({ label, value, sub, accent, delay }) {
  return (
    <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.35,delay}}>
      <Box sx={{ ...glass, p:2.5, borderLeft:`3px solid ${accent}` }}>
        <Typography sx={{ color:'#475569', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.08em', mb:1 }}>{label}</Typography>
        <Typography sx={{ fontSize:'2.2rem', fontWeight:900, color:'#f1f5f9', lineHeight:1 }}>{value}</Typography>
        {sub && <Typography sx={{ color:'#475569', fontSize:'0.73rem', mt:0.8 }}>{sub}</Typography>}
      </Box>
    </motion.div>
  )
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ts, setTs] = useState(null)

  const load = async () => {
    try { const r = await axios.get('/analytics-gk/analytics/blocked'); setData(r.data); setTs(new Date()) }
    catch(e){console.error(e)} finally{setLoading(false)}
  }
  useEffect(()=>{ load(); const t=setInterval(load,5000); return ()=>clearInterval(t) },[])

  if(loading) return (
    <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:2 }}>
      <CircularProgress sx={{ color:'#38bdf8' }} size={38}/>
      <Typography sx={{ color:'#475569' }}>Loading analytics...</Typography>
    </Box>
  )

  const events = data?.recentEvents || []
  const pie = [
    { name:'Allowed', value:data?.allowedLastHour||0, color:'#34d399' },
    { name:'Blocked', value:data?.blockedLastHour||0, color:'#f87171' },
  ]
  const timeline = [...events].reverse().slice(-20).map((e,i)=>({
    n:i+1,
    allowed:e.status==='ALLOWED'?e.responseTimeMs:null,
    blocked:e.status==='BLOCKED'?e.responseTimeMs:null,
  }))

  const chartCard = { ...glass, p:3 }

  return (
    <Container maxWidth="xl" sx={{ py:4 }}>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight:800, color:'#f1f5f9', mb:0.3 }}>📊 Analytics</Typography>
          <Typography sx={{ color:'#475569', fontSize:'0.85rem' }}>Live traffic · refreshes every 5s</Typography>
        </Box>
        <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
          {ts && <Typography sx={{ color:'#334155', fontSize:'0.75rem' }}>Updated {ts.toLocaleTimeString()}</Typography>}
          <Tooltip title="Refresh">
            <IconButton onClick={load} size="small"
              sx={{ color:'#38bdf8', bgcolor:'rgba(56,189,248,0.08)', border:'1px solid rgba(56,189,248,0.2)',
                '&:hover':{ bgcolor:'rgba(56,189,248,0.15)' } }}>
              <RefreshIcon fontSize="small"/>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb:3 }}>
        {[
          {label:'TOTAL',    value:data?.totalLastHour??0,       sub:'Last 60 min',        accent:'#38bdf8', delay:0},
          {label:'ALLOWED',  value:data?.allowedLastHour??0,     sub:'Forwarded',          accent:'#34d399', delay:0.07},
          {label:'BLOCKED',  value:data?.blockedLastHour??0,     sub:'HTTP 429 returned',  accent:'#f87171', delay:0.14},
          {label:'BLOCK RATE',value:`${data?.blockRatePercent??0}%`, sub:'Of all traffic', accent:'#fbbf24', delay:0.21},
        ].map(m=><Grid item xs={6} md={3} key={m.label}><Metric {...m}/></Grid>)}
      </Grid>

      <Grid container spacing={2.5} sx={{ mb:3 }}>
        <Grid item xs={12} md={3}>
          <Box sx={chartCard}>
            <Typography sx={{ fontWeight:700, color:'#cbd5e1', fontSize:'0.88rem', mb:2 }}>Traffic Split</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {pie.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Legend iconSize={10} formatter={v=><span style={{color:'#64748b',fontSize:'0.78rem'}}>{v}</span>}/>
                <RTooltip {...tt}/>
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box sx={chartCard}>
            <Typography sx={{ fontWeight:700, color:'#cbd5e1', fontSize:'0.88rem', mb:2 }}>Response Time (ms)</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.2}/><stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.2}/><stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="n" stroke="rgba(255,255,255,0.05)" tick={{fill:'#475569',fontSize:11}}/>
                <YAxis stroke="rgba(255,255,255,0.05)" tick={{fill:'#475569',fontSize:11}} unit="ms"/>
                <RTooltip {...tt}/>
                <Area type="monotone" dataKey="allowed" stroke="#34d399" fill="url(#ga)" strokeWidth={2} dot={{r:3,fill:'#34d399'}} name="Allowed" connectNulls={false}/>
                <Area type="monotone" dataKey="blocked" stroke="#f87171" fill="url(#gb)" strokeWidth={2} dot={{r:3,fill:'#f87171'}} name="Blocked" connectNulls={false}/>
                <Legend iconSize={10} formatter={v=><span style={{color:'#64748b',fontSize:'0.78rem'}}>{v}</span>}/>
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={chartCard}>
            <Typography sx={{ fontWeight:700, color:'#cbd5e1', fontSize:'0.88rem', mb:2 }}>Volume</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[{n:'Allowed',v:data?.allowedLastHour||0},{n:'Blocked',v:data?.blockedLastHour||0}]} barSize={52}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="n" stroke="rgba(255,255,255,0.05)" tick={{fill:'#64748b',fontSize:12}}/>
                <YAxis stroke="rgba(255,255,255,0.05)" tick={{fill:'#475569',fontSize:11}}/>
                <RTooltip {...tt}/>
                <Bar dataKey="v" radius={[6,6,0,0]}>
                  <Cell fill="#34d399"/><Cell fill="#f87171"/>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>

      {/* Events table */}
      <Box sx={glass}>
        <Box sx={{ px:3, py:2, borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Typography sx={{ fontWeight:700, color:'#cbd5e1', fontSize:'0.88rem' }}>Recent Events</Typography>
          <Chip label={`${events.length} logged`} size="small"
            sx={{ bgcolor:'rgba(255,255,255,0.05)', color:'#64748b', border:'1px solid rgba(255,255,255,0.08)', fontSize:'0.7rem' }}/>
        </Box>
        <TableContainer sx={{ maxHeight:360 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {['ID','API Key','Status','Latency','Timestamp'].map(h=>(
                  <TableCell key={h} sx={{ bgcolor:'rgba(13,21,32,0.9)', color:'#475569', fontWeight:700,
                    fontSize:'0.7rem', letterSpacing:'0.06em', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map(e=>(
                <TableRow key={e.id} sx={{ '&:hover':{ bgcolor:'rgba(255,255,255,0.02)' } }}>
                  <TableCell sx={{ color:'#334155', borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:'0.78rem' }}>{e.id}</TableCell>
                  <TableCell sx={{ fontFamily:'JetBrains Mono,monospace', color:'#7dd3fc', fontSize:'0.78rem', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{e.apiKey}</TableCell>
                  <TableCell sx={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <span className={`led-wrap ${e.status==='ALLOWED'?'led-allowed':'led-blocked'}`}>
                      <span className={`led-dot ${e.status==='ALLOWED'?'led-dot-g':'led-dot-r'}`}/>{e.status}
                    </span>
                  </TableCell>
                  <TableCell sx={{ fontFamily:'monospace', color:'#fbbf24', fontWeight:700, fontSize:'0.78rem', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{e.responseTimeMs}ms</TableCell>
                  <TableCell sx={{ color:'#334155', fontSize:'0.75rem', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{new Date(e.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  )
}