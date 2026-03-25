import React, { useState } from 'react'
import {
  Box, Container, Grid, Card, CardContent, Typography, TextField,
  Button, Chip, Divider, LinearProgress, Tooltip, IconButton
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import SendIcon from '@mui/icons-material/Send'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BlockIcon from '@mui/icons-material/Block'
import axios from 'axios'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

const GATEWAY = '/api-gk/api/resource/data'

function RequestLog({ entry }) {
  const isAllowed = entry.status === 200
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      <Box sx={{
        mb: 1.5, p: 2, borderRadius: 2,
        bgcolor: isAllowed ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
        border: `1px solid ${isAllowed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAllowed
              ? <CheckCircleIcon sx={{ color: '#10b981', fontSize: 18 }} />
              : <BlockIcon sx={{ color: '#ef4444', fontSize: 18 }} />}
            <Typography variant="body2" sx={{ fontWeight: 700, color: isAllowed ? '#10b981' : '#ef4444' }}>
              Request #{entry.requestNum} — {isAllowed ? 'ALLOWED' : 'BLOCKED'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip label={`HTTP ${entry.status}`} size="small"
              sx={{ bgcolor: isAllowed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: isAllowed ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: '0.7rem' }} />
            <Chip label={`${entry.latency}ms`} size="small"
              sx={{ bgcolor: '#1f2937', color: '#9ca3af', fontSize: '0.7rem' }} />
            <Chip label={new Date(entry.timestamp).toLocaleTimeString()} size="small"
              sx={{ bgcolor: '#1f2937', color: '#6b7280', fontSize: '0.7rem' }} />
          </Box>
        </Box>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 0.5, fontWeight: 600 }}>
              📤 REQUEST SENT
            </Typography>
            <SyntaxHighlighter language="bash" style={vscDarkPlus}
              customStyle={{ margin: 0, borderRadius: 6, fontSize: '0.72rem', background: '#0d1117', padding: '10px' }}>
              {entry.requestSnippet}
            </SyntaxHighlighter>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 0.5, fontWeight: 600 }}>
              📥 RESPONSE RECEIVED
            </Typography>
            <SyntaxHighlighter language="json" style={vscDarkPlus}
              customStyle={{ margin: 0, borderRadius: 6, fontSize: '0.72rem', background: '#0d1117', padding: '10px' }}>
              {entry.responseSnippet}
            </SyntaxHighlighter>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  )
}

export default function Playground({ logs, setLogs, requestNum }) {
  const [apiKey, setApiKey] = useState('recruiter-demo')
  const [loading, setLoading] = useState(false)
  const [demoRunning, setDemoRunning] = useState(false)
  const [copied, setCopied] = useState(false)

  const sendRequest = async (key) => {
    const num = ++requestNum.current
    const startTime = Date.now()
    const usedKey = key || apiKey || 'anonymous'
    const requestSnippet = `curl -X GET http://localhost:8090/api/resource/data \\\n  -H "X-API-KEY: ${usedKey}"`
    try {
      const res = await axios.get(GATEWAY, { headers: { 'X-API-KEY': usedKey } })
      const latency = Date.now() - startTime
      setLogs(prev => [{ requestNum: num, status: 200, latency, timestamp: Date.now(), requestSnippet, responseSnippet: JSON.stringify(res.data, null, 2) }, ...prev])
    } catch (err) {
      const latency = Date.now() - startTime
      const status = err.response?.status || 0
      const body = err.response?.data || { error: 'Request failed' }
      setLogs(prev => [{ requestNum: num, status, latency, timestamp: Date.now(), requestSnippet, responseSnippet: JSON.stringify(body, null, 2) }, ...prev])
    }
  }

  const handleSingle = async () => { setLoading(true); await sendRequest(); setLoading(false) }

  const handleDemo = async () => {
    setDemoRunning(true)
    const demoKey = `demo-${Date.now()}`
    for (let i = 0; i < 7; i++) { await sendRequest(demoKey); await new Promise(r => setTimeout(r, 400)) }
    setDemoRunning(false)
  }

  const curlExample = `curl -X GET http://localhost:8090/api/resource/data \\\n  -H "X-API-KEY: ${apiKey || 'your-api-key'}"`

  const copyToClipboard = () => { navigator.clipboard.writeText(curlExample); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const allowedCount = logs.filter(l => l.status === 200).length
  const blockedCount = logs.filter(l => l.status !== 200).length

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>🎮 Rate Limiter Playground</Typography>
        <Typography variant="body1" sx={{ color: '#9ca3af' }}>
          Send real HTTP requests through the GateKeeper API Gateway. Every request shows the exact payload sent and raw response received.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#111827', mb: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>⚙️ Request Config</Typography>
              <TextField fullWidth label="X-API-KEY Header" value={apiKey}
                onChange={e => setApiKey(e.target.value)} variant="outlined" size="small"
                helperText="Requests tracked per API key. Same key = shared rate limit."
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' } }} />

              <Box sx={{ mb: 2, p: 2, bgcolor: '#0d1117', borderRadius: 2, border: '1px solid #1f2937' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>CURL EQUIVALENT</Typography>
                  <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                    <IconButton size="small" onClick={copyToClipboard} sx={{ color: '#6b7280' }}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="caption" sx={{ fontFamily: 'JetBrains Mono, monospace', color: '#a5b4fc', whiteSpace: 'pre-wrap', fontSize: '0.72rem' }}>
                  {curlExample}
                </Typography>
              </Box>

              <Button fullWidth variant="contained" startIcon={<SendIcon />} onClick={handleSingle}
                disabled={loading || demoRunning}
                sx={{ mb: 1.5, py: 1.2, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}>
                {loading ? 'Sending...' : 'Fire Single Request'}
              </Button>
              <Button fullWidth variant="outlined" startIcon={<PlayArrowIcon />} onClick={handleDemo}
                disabled={loading || demoRunning}
                sx={{ py: 1.2, borderColor: '#6366f1', color: '#6366f1', '&:hover': { borderColor: '#4f46e5', bgcolor: 'rgba(99,102,241,0.08)' } }}>
                {demoRunning ? 'Running Demo...' : 'Run Full Demo (7 Requests)'}
              </Button>
              {demoRunning && <LinearProgress sx={{ mt: 1.5, borderRadius: 1, bgcolor: '#1f2937', '& .MuiLinearProgress-bar': { bgcolor: '#6366f1' } }} />}
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: '#111827', mb: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>📋 Rate Limit Rules</Typography>
              {[
                { label: 'Max Requests', value: '5 per window' },
                { label: 'Window Size', value: '60 seconds' },
                { label: 'Algorithm', value: 'Sliding Window Log' },
                { label: 'Storage', value: 'Redis ZSET' },
                { label: 'Latency Target', value: '< 10ms' },
                { label: 'Blocked Status', value: 'HTTP 429' },
              ].map(item => (
                <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid #1f2937' }}>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>{item.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#a5b4fc' }}>{item.value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          {logs.length > 0 && (
            <Card sx={{ bgcolor: '#111827' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">📊 Session Stats</Typography>
                  <IconButton size="small" onClick={() => { setLogs([]); requestNum.current = 0 }} sx={{ color: '#6b7280' }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Grid container spacing={1}>
                  {[
                    { label: 'Total', value: logs.length, color: '#a5b4fc' },
                    { label: 'Allowed', value: allowedCount, color: '#10b981' },
                    { label: 'Blocked', value: blockedCount, color: '#ef4444' },
                    { label: 'Avg Latency', value: `${Math.round(logs.reduce((a,b) => a + b.latency, 0) / logs.length)}ms`, color: '#f59e0b' },
                  ].map(stat => (
                    <Grid item xs={6} key={stat.label}>
                      <Box sx={{ p: 1.5, bgcolor: '#0d1117', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: stat.color }}>{stat.value}</Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>{stat.label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ bgcolor: '#111827', height: '100%', minHeight: 500 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">📡 Live Request / Response Log</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={`${allowedCount} Allowed`} size="small" sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }} />
                  <Chip label={`${blockedCount} Blocked`} size="small" sx={{ bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }} />
                </Box>
              </Box>
              <Divider sx={{ borderColor: '#1f2937', mb: 2 }} />
              {logs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h2" sx={{ mb: 2 }}>🛡️</Typography>
                  <Typography variant="h6" sx={{ color: '#6b7280' }}>No requests yet</Typography>
                  <Typography variant="body2" sx={{ color: '#4b5563', mt: 1 }}>
                    Fire a single request or run the full demo to see the rate limiter in action
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: 700, overflowY: 'auto', pr: 1 }}>
                  <AnimatePresence>
                    {logs.map((entry) => <RequestLog key={entry.requestNum} entry={entry} />)}
                  </AnimatePresence>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}