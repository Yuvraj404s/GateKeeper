import React, { useState, useEffect } from 'react'
import {
  Box, Container, Grid, Card, CardContent, Typography, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, IconButton, Tooltip, Divider
} from '@mui/material'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import RefreshIcon from '@mui/icons-material/Refresh'
import axios from 'axios'
import { motion } from 'framer-motion'

const tt = { contentStyle:{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, fontSize:'0.8rem', boxShadow:'0 4px 12px rgba(0,0,0,0.08)' } }

function Metric({ label, value, sub, top, delay }) {
  return (
    <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35, delay }}>
      <Card sx={{ height:'100%', borderTop:`3px solid ${top}` }}>
        <CardContent sx={{ p:2.5 }}>
          <Typography sx={{ color:'#94a3b8', fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.07em', mb:1 }}>{label}</Typography>
          <Typography sx={{ fontSize:'2.2rem', fontWeight:900, color:'#0f172a', lineHeight:1 }}>{value}</Typography>
          {sub && <Typography sx={{ color:'#94a3b8', fontSize:'0.75rem', mt:0.8 }}>{sub}</Typography>}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ts, setTs] = useState(null)

  const load = async () => {
    try { const r = await axios.get('/analytics-gk/analytics/blocked'); setData(r.data); setTs(new Date()) }
    catch(e){ console.error(e) } finally { setLoading(false) }
  }
  useEffect(()=>{ load(); const t=setInterval(load,5000); return ()=>clearInterval(t) },[])

  if(loading) return (
    <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:2 }}>
      <CircularProgress sx={{ color:'#7c3aed' }} size={38} />
      <Typography sx={{ color:'#94a3b8' }}>Loading...</Typography>
    </Box>
  )

  const events = data?.recentEvents || []
  const pie = [
    { name:'Allowed', value: data?.allowedLastHour||0, color:'#059669' },
    { name:'Blocked', value: data?.blockedLastHour||0, color:'#dc2626' },
  ]
  const timeline = [...events].reverse().slice(-20).map((e,i)=>({
    n: i+1,
    allowed: e.status==='ALLOWED' ? e.responseTimeMs : null,
    blocked: e.status==='BLOCKED' ? e.responseTimeMs : null,
  }))

  return (
    <Container maxWidth="xl" sx={{ py:4 }}>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight:800, color:'#0f172a', mb:0.3 }}>📊 Analytics</Typography>
          <Typography sx={{ color:'#64748b', fontSize:'0.85rem' }}>Live traffic monitoring · refreshes every 5s</Typography>
        </Box>
        <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
          {ts && <Typography sx={{ color:'#94a3b8', fontSize:'0.75rem' }}>Updated {ts.toLocaleTimeString()}</Typography>}
          <Tooltip title="Refresh now">
            <IconButton onClick={load} size="small"
              sx={{ bgcolor:'#fff', border:'1px solid #e2e8f0', color:'#64748b', '&:hover':{ color:'#7c3aed', borderColor:'#7c3aed' } }}>
              <RefreshIcon fontSize="small"/>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb:3 }}>
        {[
          { label:'TOTAL REQUESTS', value:data?.totalLastHour??0, sub:'Last 60 minutes', top:'#7c3aed', delay:0 },
          { label:'ALLOWED',        value:data?.allowedLastHour??0, sub:'Forwarded to resource', top:'#059669', delay:0.07 },
          { label:'BLOCKED',        value:data?.blockedLastHour??0, sub:'Rate limit exceeded', top:'#dc2626', delay:0.14 },
          { label:'BLOCK RATE',     value:`${data?.blockRatePercent??0}%`, sub:'Of all traffic', top:'#d97706', delay:0.21 },
        ].map(m=><Grid item xs={6} md={3} key={m.label}><Metric {...m}/></Grid>)}
      </Grid>

      <Grid container spacing={2.5} sx={{ mb:3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ p:3 }}>
              <Typography sx={{ fontWeight:700, color:'#0f172a', fontSize:'0.88rem', mb:2 }}>Traffic Split</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {pie.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Legend iconSize={10} formatter={v=><span style={{color:'#64748b',fontSize:'0.78rem'}}>{v}</span>}/>
                  <RTooltip {...tt}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent sx={{ p:3 }}>
              <Typography sx={{ fontWeight:700, color:'#0f172a', fontSize:'0.88rem', mb:2 }}>Response Time (ms)</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timeline}>
                  <defs>
                    <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="n" stroke="#e2e8f0" tick={{fill:'#94a3b8',fontSize:11}}/>
                  <YAxis stroke="#e2e8f0" tick={{fill:'#94a3b8',fontSize:11}} unit="ms"/>
                  <RTooltip {...tt}/>
                  <Area type="monotone" dataKey="allowed" stroke="#059669" fill="url(#ga)" strokeWidth={2} dot={{r:3}} name="Allowed" connectNulls={false}/>
                  <Area type="monotone" dataKey="blocked" stroke="#dc2626" fill="url(#gb)" strokeWidth={2} dot={{r:3}} name="Blocked" connectNulls={false}/>
                  <Legend iconSize={10} formatter={v=><span style={{color:'#64748b',fontSize:'0.78rem'}}>{v}</span>}/>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p:3 }}>
              <Typography sx={{ fontWeight:700, color:'#0f172a', fontSize:'0.88rem', mb:2 }}>Volume</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[{n:'Allowed',v:data?.allowedLastHour||0},{n:'Blocked',v:data?.blockedLastHour||0}]} barSize={52}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="n" stroke="#e2e8f0" tick={{fill:'#64748b',fontSize:12}}/>
                  <YAxis stroke="#e2e8f0" tick={{fill:'#94a3b8',fontSize:11}}/>
                  <RTooltip {...tt}/>
                  <Bar dataKey="v" radius={[6,6,0,0]}>
                    <Cell fill="#059669"/><Cell fill="#dc2626"/>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent sx={{ p:3 }}>
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
            <Typography sx={{ fontWeight:700, color:'#0f172a', fontSize:'0.88rem' }}>Recent Events</Typography>
            <Chip label={`${events.length} logged`} size="small"
              sx={{ bgcolor:'#f8f9fc', color:'#64748b', border:'1px solid #e2e8f0', fontSize:'0.7rem' }}/>
          </Box>
          <TableContainer sx={{ maxHeight:360, borderRadius:'8px', border:'1px solid #f1f5f9' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {['ID','API Key','Status','Latency','Timestamp'].map(h=>(
                    <TableCell key={h} sx={{ bgcolor:'#f8f9fc', color:'#64748b', fontWeight:700,
                      fontSize:'0.72rem', letterSpacing:'0.05em', borderBottom:'1px solid #e2e8f0' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map(e=>(
                  <TableRow key={e.id} sx={{ '&:hover':{ bgcolor:'#fafafa' } }}>
                    <TableCell sx={{ color:'#94a3b8', fontSize:'0.78rem', borderBottom:'1px solid #f8f9fc' }}>{e.id}</TableCell>
                    <TableCell sx={{ fontFamily:'JetBrains Mono,monospace', color:'#374151', fontSize:'0.78rem', fontWeight:500, borderBottom:'1px solid #f8f9fc' }}>{e.apiKey}</TableCell>
                    <TableCell sx={{ borderBottom:'1px solid #f8f9fc' }}>
                      <span className={`led-wrap ${e.status==='ALLOWED'?'led-allowed':'led-blocked'}`}>
                        <span className={`led-dot ${e.status==='ALLOWED'?'led-dot-g':'led-dot-r'}`}/>
                        {e.status}
                      </span>
                    </TableCell>
                    <TableCell sx={{ fontFamily:'monospace', color:'#b45309', fontWeight:700, fontSize:'0.78rem', borderBottom:'1px solid #f8f9fc' }}>{e.responseTimeMs}ms</TableCell>
                    <TableCell sx={{ color:'#94a3b8', fontSize:'0.75rem', borderBottom:'1px solid #f8f9fc' }}>{new Date(e.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  )
}