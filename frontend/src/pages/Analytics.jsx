import React, { useState, useEffect } from 'react'
import {
  Box, Container, Grid, Card, CardContent, Typography,
  Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, IconButton, Tooltip, Avatar
} from '@mui/material'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts'
import RefreshIcon from '@mui/icons-material/Refresh'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BlockIcon from '@mui/icons-material/Block'
import BoltIcon from '@mui/icons-material/Bolt'
import axios from 'axios'
import { motion } from 'framer-motion'

const cardStyle = {
  bgcolor: 'rgba(15,34,54,0.9)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(168,85,247,0.15)',
  borderRadius: '16px',
}

const tooltipStyle = { background: '#0d1b2a', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 10, color: '#e2e8f0' }

function StatCard({ title, value, subtitle, color, bg, icon, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay }}>
      <Card sx={{ ...cardStyle, border: `1px solid ${color}22`, boxShadow: `0 0 24px ${color}0d`, height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 0.8, fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.05em' }}>{title}</Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color, lineHeight: 1, fontSize: '2.4rem' }}>{value}</Typography>
              {subtitle && <Typography variant="caption" sx={{ color: '#475569', mt: 0.5, display: 'block' }}>{subtitle}</Typography>}
            </Box>
            <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: `1px solid ${color}33` }}>
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)

  const fetchData = async () => {
    try {
      const res = await axios.get('/analytics-gk/analytics/blocked')
      setData(res.data)
      setLastRefresh(new Date())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData(); const t = setInterval(fetchData, 5000); return () => clearInterval(t) }, [])

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
      <CircularProgress sx={{ color: '#a855f7' }} size={48} />
      <Typography sx={{ color: '#475569' }}>Loading analytics...</Typography>
    </Box>
  )

  const pieData = [
    { name: 'Allowed', value: data?.allowedLastHour || 0, color: '#00f5ff' },
    { name: 'Blocked', value: data?.blockedLastHour || 0, color: '#ff4d6d' },
  ]

  const recentEvents = data?.recentEvents || []

  const timelineData = [...recentEvents].reverse().slice(-20).map((e, i) => ({
    name: `#${i + 1}`,
    allowed: e.status === 'ALLOWED' ? e.responseTimeMs : null,
    blocked: e.status === 'BLOCKED' ? e.responseTimeMs : null,
  }))

  const barData = [
    { name: 'Allowed', count: data?.allowedLastHour || 0, fill: '#00f5ff' },
    { name: 'Blocked', count: data?.blockedLastHour || 0, fill: '#ff4d6d' },
  ]

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5, background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            📊 Analytics Dashboard
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>Real-time traffic monitoring. Auto-refreshes every 5 seconds.</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {lastRefresh && <Typography variant="caption" sx={{ color: '#334155' }}>Updated {lastRefresh.toLocaleTimeString()}</Typography>}
          <Tooltip title="Refresh now">
            <IconButton onClick={fetchData}
              sx={{ color: '#a855f7', bgcolor: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', '&:hover': { bgcolor: 'rgba(168,85,247,0.15)' } }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { title: 'TOTAL REQUESTS', value: data?.totalLastHour ?? 0, color: '#a855f7', bg: 'rgba(168,85,247,0.1)', icon: '📡', subtitle: 'Last hour', delay: 0 },
          { title: 'ALLOWED', value: data?.allowedLastHour ?? 0, color: '#00f5ff', bg: 'rgba(0,245,255,0.1)', icon: '✅', subtitle: 'Forwarded to resource', delay: 0.08 },
          { title: 'BLOCKED', value: data?.blockedLastHour ?? 0, color: '#ff4d6d', bg: 'rgba(255,77,109,0.1)', icon: '🚫', subtitle: 'Rate limit exceeded', delay: 0.16 },
          { title: 'BLOCK RATE', value: `${data?.blockRatePercent ?? 0}%`, color: '#ffd60a', bg: 'rgba(255,214,10,0.1)', icon: '📈', subtitle: 'Of all traffic', delay: 0.24 },
        ].map(s => (
          <Grid item xs={12} sm={6} md={3} key={s.title}><StatCard {...s} /></Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Pie */}
        <Grid item xs={12} md={4}>
          <Card sx={cardStyle}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#e2e8f0' }}>Traffic Split</Typography>
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={5} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} opacity={0.85} />)}
                  </Pie>
                  <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{v}</span>} />
                  <RTooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar */}
        <Grid item xs={12} md={4}>
          <Card sx={cardStyle}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#e2e8f0' }}>Requests Volume</Typography>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={barData} barSize={52}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,85,247,0.08)" />
                  <XAxis dataKey="name" stroke="#334155" tick={{ fill: '#64748b', fontSize: 13 }} />
                  <YAxis stroke="#334155" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <RTooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {barData.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Line chart */}
        <Grid item xs={12} md={4}>
          <Card sx={cardStyle}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#e2e8f0' }}>Response Times (ms)</Typography>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff4d6d" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,85,247,0.08)" />
                  <XAxis dataKey="name" stroke="#334155" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis stroke="#334155" tick={{ fill: '#64748b', fontSize: 11 }} unit="ms" />
                  <RTooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="allowed" stroke="#00f5ff" fill="url(#gradCyan)" strokeWidth={2} dot={{ r: 3, fill: '#00f5ff' }} name="Allowed" connectNulls={false} />
                  <Area type="monotone" dataKey="blocked" stroke="#ff4d6d" fill="url(#gradRed)" strokeWidth={2} dot={{ r: 3, fill: '#ff4d6d' }} name="Blocked" connectNulls={false} />
                  <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{v}</span>} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Events Table */}
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#e2e8f0' }}>🗂️ Recent Events</Typography>
            <Chip label={`${recentEvents.length} events`} size="small"
              sx={{ bgcolor: 'rgba(168,85,247,0.1)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)' }} />
          </Box>
          <TableContainer sx={{ maxHeight: 380, borderRadius: '10px', border: '1px solid rgba(168,85,247,0.08)' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {['ID', 'API Key', 'Status', 'Response Time', 'Timestamp'].map(h => (
                    <TableCell key={h} sx={{ bgcolor: '#060e18', color: '#475569', fontWeight: 800, borderBottom: '1px solid rgba(168,85,247,0.1)', fontSize: '0.72rem', letterSpacing: '0.06em' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {recentEvents.map((e) => (
                  <TableRow key={e.id} sx={{ '&:hover': { bgcolor: 'rgba(168,85,247,0.04)' }, transition: 'background 0.2s' }}>
                    <TableCell sx={{ color: '#334155', borderBottom: '1px solid rgba(168,85,247,0.05)', fontSize: '0.8rem' }}>{e.id}</TableCell>
                    <TableCell sx={{ fontFamily: 'JetBrains Mono, monospace', color: '#a855f7', borderBottom: '1px solid rgba(168,85,247,0.05)', fontSize: '0.78rem' }}>{e.apiKey}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(168,85,247,0.05)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        {e.status === 'ALLOWED'
                          ? <CheckCircleIcon sx={{ fontSize: 14, color: '#00f5ff' }} />
                          : <BlockIcon sx={{ fontSize: 14, color: '#ff4d6d' }} />}
                        <Typography variant="caption" sx={{ fontWeight: 800, color: e.status === 'ALLOWED' ? '#00f5ff' : '#ff4d6d', fontSize: '0.75rem' }}>{e.status}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(168,85,247,0.05)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BoltIcon sx={{ fontSize: 13, color: '#ffd60a' }} />
                        <Typography variant="caption" sx={{ fontFamily: 'JetBrains Mono, monospace', color: '#ffd60a', fontWeight: 700 }}>{e.responseTimeMs}ms</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#334155', borderBottom: '1px solid rgba(168,85,247,0.05)', fontSize: '0.75rem' }}>{new Date(e.timestamp).toLocaleString()}</TableCell>
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