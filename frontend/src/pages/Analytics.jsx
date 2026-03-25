import React, { useState, useEffect } from 'react'
import {
  Box, Grid, Typography, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress,
  IconButton, Tooltip, Divider, Paper
} from '@mui/material'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import RefreshIcon from '@mui/icons-material/Refresh'
import axios from 'axios'
import { motion } from 'framer-motion'

const tt = { contentStyle: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.8rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }, cursor: false }

function MetricCard({ label, value, sub, accent, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }}>
      <Box sx={{ bgcolor: '#fff', borderRadius: '8px', p: 2.5, border: '1px solid #e5e7eb',
        borderTop: `3px solid ${accent}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', height: '100%' }}>
        <Typography sx={{ color: '#9ca3af', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em', mb: 1 }}>{label}</Typography>
        <Typography sx={{ fontSize: '2.2rem', fontWeight: 900, color: '#111827', lineHeight: 1 }}>{value}</Typography>
        {sub && <Typography sx={{ color: '#9ca3af', fontSize: '0.75rem', mt: 0.8 }}>{sub}</Typography>}
      </Box>
    </motion.div>
  )
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ts, setTs] = useState(null)

  const fetchData = async () => {
    try { const r = await axios.get('/analytics-gk/analytics/blocked'); setData(r.data); setTs(new Date()) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { fetchData(); const t = setInterval(fetchData, 5000); return () => clearInterval(t) }, [])

  if (loading) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 2 }}>
      <CircularProgress sx={{ color: '#ef6c1a' }} size={40} />
      <Typography sx={{ color: '#9ca3af', fontSize: '0.9rem' }}>Loading analytics data...</Typography>
    </Box>
  )

  const events = data?.recentEvents || []
  const pieData = [
    { name: 'Allowed', value: data?.allowedLastHour || 0, color: '#10b981' },
    { name: 'Blocked', value: data?.blockedLastHour || 0, color: '#ef4444' },
  ]
  const timeline = [...events].reverse().slice(-20).map((e, i) => ({
    i: i + 1,
    allowed: e.status === 'ALLOWED' ? e.responseTimeMs : null,
    blocked: e.status === 'BLOCKED' ? e.responseTimeMs : null,
  }))

  return (
    <Box sx={{ p: 4, bgcolor: '#f3f4f6', minHeight: 'calc(100vh - 56px)' }}>

      {/* Page header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>Analytics</Typography>
          <Typography sx={{ color: '#9ca3af', fontSize: '0.82rem', mt: 0.3 }}>
            Real-time request traffic · auto-refreshes every 5s
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {ts && <Typography sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>Updated {ts.toLocaleTimeString()}</Typography>}
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} size="small"
              sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', color: '#6b7280', '&:hover': { color: '#ef6c1a', borderColor: '#ef6c1a' } }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Metric cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'TOTAL REQUESTS', value: data?.totalLastHour ?? 0, sub: 'Last 60 minutes', accent: '#6366f1', delay: 0 },
          { label: 'ALLOWED', value: data?.allowedLastHour ?? 0, sub: 'Forwarded to resource', accent: '#10b981', delay: 0.07 },
          { label: 'BLOCKED', value: data?.blockedLastHour ?? 0, sub: 'Rate limit exceeded', accent: '#ef4444', delay: 0.14 },
          { label: 'BLOCK RATE', value: `${data?.blockRatePercent ?? 0}%`, sub: 'Of all traffic', accent: '#f59e0b', delay: 0.21 },
        ].map(m => <Grid item xs={6} md={3} key={m.label}><MetricCard {...m} /></Grid>)}
      </Grid>

      {/* Charts row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Box sx={{ bgcolor: '#fff', borderRadius: '8px', p: 2.5, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: '0.88rem', mb: 2 }}>Traffic Split</Typography>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Legend iconSize={10} formatter={v => <span style={{ color: '#6b7280', fontSize: '0.78rem' }}>{v}</span>} />
                <RTooltip {...tt} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box sx={{ bgcolor: '#fff', borderRadius: '8px', p: 2.5, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: '0.88rem', mb: 2 }}>Response Time per Request (ms)</Typography>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="i" stroke="#e5e7eb" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis stroke="#e5e7eb" tick={{ fill: '#9ca3af', fontSize: 11 }} unit="ms" />
                <RTooltip {...tt} />
                <Area type="monotone" dataKey="allowed" stroke="#10b981" fill="url(#ga)" strokeWidth={2} dot={{ r: 3 }} name="Allowed" connectNulls={false} />
                <Area type="monotone" dataKey="blocked" stroke="#ef4444" fill="url(#gb)" strokeWidth={2} dot={{ r: 3 }} name="Blocked" connectNulls={false} />
                <Legend iconSize={10} formatter={v => <span style={{ color: '#6b7280', fontSize: '0.78rem' }}>{v}</span>} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ bgcolor: '#fff', borderRadius: '8px', p: 2.5, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: '0.88rem', mb: 2 }}>Volume</Typography>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={[
                { n: 'Allowed', v: data?.allowedLastHour || 0 },
                { n: 'Blocked', v: data?.blockedLastHour || 0 },
              ]} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="n" stroke="#e5e7eb" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis stroke="#e5e7eb" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <RTooltip {...tt} />
                <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>

      {/* Events table */}
      <Box sx={{ bgcolor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: '0.88rem' }}>Recent Events</Typography>
          <Chip label={`${events.length} logged`} size="small"
            sx={{ bgcolor: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb', fontSize: '0.7rem', height: 22 }} />
        </Box>
        <TableContainer sx={{ maxHeight: 360 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {['ID', 'API Key', 'Status', 'Latency', 'Timestamp'].map(h => (
                  <TableCell key={h} sx={{ bgcolor: '#f9fafb', color: '#6b7280', fontWeight: 700, fontSize: '0.72rem',
                    letterSpacing: '0.06em', borderBottom: '1px solid #e5e7eb' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map(e => (
                <TableRow key={e.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                  <TableCell sx={{ color: '#9ca3af', fontSize: '0.78rem', borderBottom: '1px solid #f3f4f6' }}>{e.id}</TableCell>
                  <TableCell sx={{ fontFamily: 'JetBrains Mono, monospace', color: '#374151', fontSize: '0.78rem', fontWeight: 500, borderBottom: '1px solid #f3f4f6' }}>{e.apiKey}</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #f3f4f6' }}>
                    <span className={e.status === 'ALLOWED' ? 'status-allowed' : 'status-blocked'}>
                      <span className={`led ${e.status === 'ALLOWED' ? 'led-green' : 'led-red'}`} />
                      {e.status}
                    </span>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', color: '#f59e0b', fontWeight: 700, fontSize: '0.78rem', borderBottom: '1px solid #f3f4f6' }}>{e.responseTimeMs}ms</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontSize: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>{new Date(e.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}