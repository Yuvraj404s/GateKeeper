import React, { useState, useEffect } from 'react'
import {
  Box, Container, Grid, Card, CardContent, Typography,
  Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, IconButton, Tooltip
} from '@mui/material'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import RefreshIcon from '@mui/icons-material/Refresh'
import axios from 'axios'
import { motion } from 'framer-motion'

const StatCard = ({ title, value, subtitle, color, icon }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
    <Card sx={{ bgcolor: '#111827', height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" sx={{ color: '#9ca3af', mb: 0.5 }}>{title}</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
            {subtitle && <Typography variant="caption" sx={{ color: '#6b7280', mt: 0.5, display: 'block' }}>{subtitle}</Typography>}
          </Box>
          <Typography variant="h3">{icon}</Typography>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
)

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)

  const fetch = async () => {
    try {
      const res = await axios.get('/analytics-gk/analytics/blocked')
      setData(res.data)
      setLastRefresh(new Date())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch(); const t = setInterval(fetch, 5000); return () => clearInterval(t) }, [])

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress sx={{ color: '#6366f1' }} />
    </Box>
  )

  const pieData = [
    { name: 'Allowed', value: data?.allowedLastHour || 0, color: '#10b981' },
    { name: 'Blocked', value: data?.blockedLastHour || 0, color: '#ef4444' },
  ]

  const recentEvents = data?.recentEvents || []

  const timelineData = [...recentEvents].reverse().slice(-20).map((e, i) => ({
    name: `#${i + 1}`,
    allowed: e.status === 'ALLOWED' ? e.responseTimeMs : null,
    blocked: e.status === 'BLOCKED' ? e.responseTimeMs : null,
    time: new Date(e.timestamp).toLocaleTimeString(),
  }))

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>📊 Analytics Dashboard</Typography>
          <Typography variant="body1" sx={{ color: '#9ca3af' }}>
            Real-time traffic monitoring. Auto-refreshes every 5 seconds.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {lastRefresh && <Typography variant="caption" sx={{ color: '#6b7280' }}>Last updated: {lastRefresh.toLocaleTimeString()}</Typography>}
          <Tooltip title="Refresh now">
            <IconButton onClick={fetch} sx={{ color: '#6366f1' }}><RefreshIcon /></IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Total Requests (Last Hour)', value: data?.totalLastHour ?? 0, color: '#a5b4fc', icon: '📡', subtitle: 'All traffic through gateway' },
          { title: 'Allowed', value: data?.allowedLastHour ?? 0, color: '#10b981', icon: '✅', subtitle: 'Requests forwarded to resource' },
          { title: 'Blocked', value: data?.blockedLastHour ?? 0, color: '#ef4444', icon: '🚫', subtitle: 'Rate limit exceeded (HTTP 429)' },
          { title: 'Block Rate', value: `${data?.blockRatePercent ?? 0}%`, color: '#f59e0b', icon: '📈', subtitle: 'Percentage of blocked traffic' },
        ].map(s => (
          <Grid item xs={12} sm={6} md={3} key={s.title}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#111827' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Traffic Split</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Legend />
                  <RTooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Response Time Line Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ bgcolor: '#111827' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Response Time per Request (ms)</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#4b5563" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} unit="ms" />
                  <RTooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="allowed" stroke="#10b981" dot={{ r: 4 }} strokeWidth={2} name="Allowed (ms)" connectNulls={false} />
                  <Line type="monotone" dataKey="blocked" stroke="#ef4444" dot={{ r: 4 }} strokeWidth={2} name="Blocked (ms)" connectNulls={false} />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Events Table */}
      <Card sx={{ bgcolor: '#111827' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>🗂️ Recent Events (Last 50)</Typography>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {['#', 'API Key', 'Status', 'Response Time', 'Timestamp'].map(h => (
                    <TableCell key={h} sx={{ bgcolor: '#0d1117', color: '#9ca3af', fontWeight: 700, borderBottom: '1px solid #1f2937', fontSize: '0.75rem' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {recentEvents.map((e, i) => (
                  <TableRow key={e.id} sx={{ '&:hover': { bgcolor: 'rgba(99,102,241,0.04)' } }}>
                    <TableCell sx={{ color: '#6b7280', borderBottom: '1px solid #1a2332', fontSize: '0.8rem' }}>{e.id}</TableCell>
                    <TableCell sx={{ fontFamily: 'JetBrains Mono, monospace', color: '#a5b4fc', borderBottom: '1px solid #1a2332', fontSize: '0.78rem' }}>{e.apiKey}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #1a2332' }}>
                      <Chip label={e.status} size="small"
                        sx={{ bgcolor: e.status === 'ALLOWED' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: e.status === 'ALLOWED' ? '#10b981' : '#ef4444',
                          fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
                    </TableCell>
                    <TableCell sx={{ color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace', borderBottom: '1px solid #1a2332', fontSize: '0.8rem' }}>{e.responseTimeMs}ms</TableCell>
                    <TableCell sx={{ color: '#6b7280', borderBottom: '1px solid #1a2332', fontSize: '0.78rem' }}>{new Date(e.timestamp).toLocaleString()}</TableCell>
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