import React, { useState, useEffect } from 'react'
import { Box, Container, Grid, Card, CardContent, Typography, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, IconButton, Tooltip } from '@mui/material'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import RefreshIcon from '@mui/icons-material/Refresh'
import axios from 'axios'
import { motion } from 'framer-motion'

const tt = { contentStyle:{ background:'#27272a', border:'1px solid #3f3f46', borderRadius:8, color:'#e4e4e7', fontSize:'0.8rem' } }

function Metric({ label, value, sub, color, delay }) {
  return (
    <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.3,delay}}>
      <Card sx={{ height:'100%', borderLeft:`3px solid ${color}` }}>
        <CardContent sx={{ p:2.5 }}>
          <Typography sx={{ color:'#52525b', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.07em', mb:1 }}>{label}</Typography>
          <Typography sx={{ fontSize:'2.1rem', fontWeight:900, color:'#e4e4e7', lineHeight:1 }}>{value}</Typography>
          {sub && <Typography sx={{ color:'#52525b', fontSize:'0.73rem', mt:0.8 }}>{sub}</Typography>}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ts, setTs] = useState(null)
  const load = async()=>{ try{ const r=await axios.get('https://gatekeeper-analytics.onrender.com/analytics/blocked'); setData(r.data); setTs(new Date()) }catch(e){console.error(e)}finally{setLoading(false)} }
  useEffect(()=>{ load(); const t=setInterval(load,5000); return()=>clearInterval(t) },[])

  if(loading) return <Box sx={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:2}}>
    <CircularProgress sx={{color:'#f97316'}} size={36}/><Typography sx={{color:'#71717a'}}>Loading...</Typography></Box>

  const events = data?.recentEvents||[]
  const pie = [{name:'Allowed',value:data?.allowedLastHour||0,color:'#22c55e'},{name:'Blocked',value:data?.blockedLastHour||0,color:'#ef4444'}]
  const timeline = [...events].reverse().slice(-20).map((e,i)=>({
    n:i+1, allowed:e.status==='ALLOWED'?e.responseTimeMs:null, blocked:e.status==='BLOCKED'?e.responseTimeMs:null
  }))

  return (
    <Container maxWidth="xl" sx={{ py:4 }}>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight:800, color:'#e4e4e7', mb:0.3 }}>📊 Analytics</Typography>
          <Typography sx={{ color:'#71717a', fontSize:'0.84rem' }}>Live traffic · auto-refreshes every 5s</Typography>
        </Box>
        <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
          {ts && <Typography sx={{ color:'#3f3f46', fontSize:'0.74rem' }}>Updated {ts.toLocaleTimeString()}</Typography>}
          <IconButton onClick={load} size="small"
            sx={{ color:'#71717a', bgcolor:'#27272a', border:'1px solid #3f3f46', '&:hover':{color:'#f97316',borderColor:'#f97316'} }}>
            <RefreshIcon fontSize="small"/>
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb:3 }}>
        {[
          {label:'TOTAL',     value:data?.totalLastHour??0,       sub:'Last 60 min',       color:'#f97316', delay:0},
          {label:'ALLOWED',   value:data?.allowedLastHour??0,     sub:'Forwarded',         color:'#22c55e', delay:0.07},
          {label:'BLOCKED',   value:data?.blockedLastHour??0,     sub:'HTTP 429',          color:'#ef4444', delay:0.14},
          {label:'BLOCK RATE',value:`${data?.blockRatePercent??0}%`,sub:'Of all traffic',  color:'#eab308', delay:0.21},
        ].map(m=><Grid item xs={6} md={3} key={m.label}><Metric {...m}/></Grid>)}
      </Grid>

      <Grid container spacing={2.5} sx={{ mb:3 }}>
        <Grid item xs={12} md={3}>
          <Card><CardContent sx={{ p:3 }}>
            <Typography sx={{ fontWeight:700, color:'#d4d4d8', fontSize:'0.86rem', mb:2 }}>Traffic Split</Typography>
            <ResponsiveContainer width="100%" height={195}>
              <PieChart>
                <Pie data={pie} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {pie.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Legend iconSize={10} formatter={v=><span style={{color:'#71717a',fontSize:'0.78rem'}}>{v}</span>}/>
                <RTooltip {...tt}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card><CardContent sx={{ p:3 }}>
            <Typography sx={{ fontWeight:700, color:'#d4d4d8', fontSize:'0.86rem', mb:2 }}>Response Time (ms)</Typography>
            <ResponsiveContainer width="100%" height={195}>
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.18}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.18}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46"/>
                <XAxis dataKey="n" stroke="#3f3f46" tick={{fill:'#52525b',fontSize:11}}/>
                <YAxis stroke="#3f3f46" tick={{fill:'#52525b',fontSize:11}} unit="ms"/>
                <RTooltip {...tt}/>
                <Area type="monotone" dataKey="allowed" stroke="#22c55e" fill="url(#ga)" strokeWidth={2} dot={{r:3,fill:'#22c55e'}} name="Allowed" connectNulls={false}/>
                <Area type="monotone" dataKey="blocked" stroke="#ef4444" fill="url(#gb)" strokeWidth={2} dot={{r:3,fill:'#ef4444'}} name="Blocked" connectNulls={false}/>
                <Legend iconSize={10} formatter={v=><span style={{color:'#71717a',fontSize:'0.78rem'}}>{v}</span>}/>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card><CardContent sx={{ p:3 }}>
            <Typography sx={{ fontWeight:700, color:'#d4d4d8', fontSize:'0.86rem', mb:2 }}>Volume</Typography>
            <ResponsiveContainer width="100%" height={195}>
              <BarChart data={[{n:'Allowed',v:data?.allowedLastHour||0},{n:'Blocked',v:data?.blockedLastHour||0}]} barSize={52}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46"/>
                <XAxis dataKey="n" stroke="#3f3f46" tick={{fill:'#71717a',fontSize:12}}/>
                <YAxis stroke="#3f3f46" tick={{fill:'#52525b',fontSize:11}}/>
                <RTooltip {...tt}/>
                <Bar dataKey="v" radius={[6,6,0,0]}><Cell fill="#22c55e"/><Cell fill="#ef4444"/></Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Card>
        <Box sx={{ px:3, py:2, borderBottom:'1px solid #3f3f46', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Typography sx={{ fontWeight:700, color:'#d4d4d8', fontSize:'0.86rem' }}>Recent Events</Typography>
          <Chip label={`${events.length} logged`} size="small" sx={{ bgcolor:'#18181b', color:'#71717a', border:'1px solid #3f3f46', fontSize:'0.7rem' }}/>
        </Box>
        <TableContainer sx={{ maxHeight:360 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {['ID','API Key','Status','Latency','Timestamp'].map(h=>(
                  <TableCell key={h} sx={{ bgcolor:'#1c1c1f', color:'#52525b', fontWeight:700,
                    fontSize:'0.7rem', letterSpacing:'0.06em', borderBottom:'1px solid #3f3f46' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map(e=>(
                <TableRow key={e.id} sx={{ '&:hover':{ bgcolor:'#2a2a2d' } }}>
                  <TableCell sx={{ color:'#52525b', fontSize:'0.77rem', borderBottom:'1px solid #3f3f46' }}>{e.id}</TableCell>
                  <TableCell sx={{ fontFamily:'JetBrains Mono,monospace', color:'#fb923c', fontSize:'0.77rem', borderBottom:'1px solid #3f3f46' }}>{e.apiKey}</TableCell>
                  <TableCell sx={{ borderBottom:'1px solid #3f3f46' }}>
                    <span className={`led-wrap ${e.status==='ALLOWED'?'led-allowed':'led-blocked'}`}>
                      <span className={`led-dot ${e.status==='ALLOWED'?'led-g':'led-r'}`}/>{e.status}
                    </span>
                  </TableCell>
                  <TableCell sx={{ fontFamily:'monospace', color:'#fde047', fontWeight:700, fontSize:'0.77rem', borderBottom:'1px solid #3f3f46' }}>{e.responseTimeMs}ms</TableCell>
                  <TableCell sx={{ color:'#52525b', fontSize:'0.74rem', borderBottom:'1px solid #3f3f46' }}>{new Date(e.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Container>
  )
}