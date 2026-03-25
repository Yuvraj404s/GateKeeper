import React, { useState } from 'react'
import {
  Box, Container, Grid, Card, CardContent, Typography, TextField,
  Button, Chip, Divider, LinearProgress, Tooltip, IconButton, Avatar
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import SendIcon from '@mui/icons-material/Send'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BlockIcon from '@mui/icons-material/Block'
import BoltIcon from '@mui/icons-material/Bolt'
import axios from 'axios'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

const GATEWAY = '/api-gk/api/resource/data'

const cardStyle = {
  bgcolor: 'rgba(15,34,54,0.9)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(168,85,247,0.15)',
  borderRadius: '16px',
}

function RequestLog({ entry }) {
  const ok = entry.status === 200
  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Box sx={{
        mb: 2, p: 2.5, borderRadius: '14px',
        background: ok
          ? 'linear-gradient(135deg, rgba(0,245,255,0.04), rgba(0,245,255,0.01))'
          : 'linear-gradient(135deg, rgba(255,77,109,0.06), rgba(255,77,109,0.01))',
        border: `1px solid ${ok ? 'rgba(0,245,255,0.25)' : 'rgba(255,77,109,0.25)'}`,
        boxShadow: ok ? '0 0 20px rgba(0,245,255,0.06)' : '0 0 20px rgba(255,77,109,0.06)',
      }}>
        {/* Header row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: ok ? 'rgba(0,245,255,0.15)' : 'rgba(255,77,109,0.15)' }}>
              {ok
                ? <CheckCircleIcon sx={{ color: '#00f5ff', fontSize: 17 }} />
                : <BlockIcon sx={{ color: '#ff4d6d', fontSize: 17 }} />}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 800, color: ok ? '#00f5ff' : '#ff4d6d', letterSpacing: '0.03em' }}>
              #{entry.requestNum} — {ok ? 'ALLOWED' : 'BLOCKED'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.8 }}>
            <Chip label={`HTTP ${entry.status}`} size="small" sx={{
              bgcolor: ok ? 'rgba(0,245,255,0.12)' : 'rgba(255,77,109,0.12)',
              color: ok ? '#00f5ff' : '#ff4d6d',
              border: `1px solid ${ok ? 'rgba(0,245,255,0.3)' : 'rgba(255,77,109,0.3)'}`,
              fontWeight: 800, fontSize: '0.7rem', height: 22,
            }} />
            <Chip icon={<BoltIcon sx={{ fontSize: '12px !important', color: '#ffd60a !important' }} />}
              label={`${entry.latency}ms`} size="small"
              sx={{ bgcolor: 'rgba(255,214,10,0.08)', color: '#ffd60a', border: '1px solid rgba(255,214,10,0.2)', fontSize: '0.7rem', height: 22 }} />
            <Chip label={new Date(entry.timestamp).toLocaleTimeString()} size="small"
              sx={{ bgcolor: 'rgba(148,163,184,0.06)', color: '#64748b', fontSize: '0.7rem', height: 22 }} />
          </Box>
        </Box>

        <Grid container spacing={1.5}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 0.8, display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#a855f7' }} />
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.68rem' }}>REQUEST SENT</Typography>
            </Box>
            <SyntaxHighlighter language="bash" style={vscDarkPlus}
              customStyle={{ margin: 0, borderRadius: 8, fontSize: '0.72rem', background: '#060e18', padding: '10px', border: '1px solid rgba(168,85,247,0.1)' }}>
              {entry.requestSnippet}
            </SyntaxHighlighter>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 0.8, display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: ok ? '#00f5ff' : '#ff4d6d' }} />
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.68rem' }}>RESPONSE RECEIVED</Typography>
            </Box>
            <SyntaxHighlighter language="json" style={vscDarkPlus}
              customStyle={{ margin: 0, borderRadius: 8, fontSize: '0.72rem', background: '#060e18', padding: '10px', border: `1px solid ${ok ? 'rgba(0,245,255,0.1)' : 'rgba(255,77,109,0.1)'}` }}>
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
  const [demoProgress, setDemoProgress] = useState(0)

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
    setDemoRunning(true); setDemoProgress(0)
    const demoKey = `demo-${Date.now()}`
    for (let i = 0; i < 7; i++) {
      await sendRequest(demoKey)
      setDemoProgress(Math.round(((i + 1) / 7) * 100))
      await new Promise(r => setTimeout(r, 420))
    }
    setDemoRunning(false)
  }

  const curlExample = `curl -X GET http://localhost:8090/api/resource/data \\\n  -H "X-API-KEY: ${apiKey || 'your-key'}"`
  const copyToClipboard = () => { navigator.clipboard.writeText(curlExample); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const allowedCount = logs.filter(l => l.status === 200).length
  const blockedCount = logs.filter(l => l.status !== 200).length

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4 } }}>

      {/* Hero Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🎮 Rate Limiter Playground
          </Typography>
          <Chip label="LIVE" size="small" sx={{ bgcolor: 'rgba(0,245,255,0.1)', color: '#00f5ff', border: '1px solid rgba(0,245,255,0.3)', fontWeight: 800, fontSize: '0.68rem', height: 22 }} />
        </Box>
        <Typography sx={{ color: '#64748b', fontSize: '0.95rem' }}>
          Send real HTTP requests through the GateKeeper API Gateway. Every hop is transparent — see the exact curl sent and raw JSON received.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Panel */}
        <Grid item xs={12} md={4}>

          {/* Config Card */}
          <Card sx={{ ...cardStyle, mb: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2.5, color: '#e2e8f0' }}>⚙️ Request Config</Typography>

              <TextField fullWidth label="X-API-KEY Header" value={apiKey}
                onChange={e => setApiKey(e.target.value)} variant="outlined" size="small"
                helperText="Same key = shared rate limit window"
                sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', bgcolor: 'rgba(13,27,42,0.8)' },
                  '& .MuiFormHelperText-root': { color: '#475569' } }} />

              {/* Curl Preview */}
              <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#060e18', borderRadius: '10px', border: '1px solid rgba(168,85,247,0.15)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.65rem' }}>CURL EQUIVALENT</Typography>
                  <Tooltip title={copied ? '✅ Copied!' : 'Copy to clipboard'}>
                    <IconButton size="small" onClick={copyToClipboard} sx={{ color: copied ? '#00f5ff' : '#475569', transition: 'color 0.2s' }}>
                      <ContentCopyIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="caption" sx={{ fontFamily: 'JetBrains Mono, monospace', color: '#a855f7', whiteSpace: 'pre-wrap', fontSize: '0.7rem', lineHeight: 1.7 }}>
                  {curlExample}
                </Typography>
              </Box>

              {/* Buttons */}
              <Button fullWidth variant="contained" startIcon={<SendIcon />} onClick={handleSingle}
                disabled={loading || demoRunning}
                sx={{ mb: 1.5, py: 1.3, fontSize: '0.9rem',
                  background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
                  boxShadow: '0 0 20px rgba(168,85,247,0.3)',
                  '&:hover': { background: 'linear-gradient(135deg, #9333ea, #0891b2)', boxShadow: '0 0 30px rgba(168,85,247,0.5)' },
                  '&:disabled': { background: 'rgba(168,85,247,0.2)', color: '#475569' }
                }}>
                {loading ? 'Sending...' : 'Fire Single Request'}
              </Button>

              <Button fullWidth variant="outlined" startIcon={<PlayArrowIcon />} onClick={handleDemo}
                disabled={loading || demoRunning}
                sx={{ py: 1.3, fontSize: '0.9rem',
                  borderColor: 'rgba(168,85,247,0.5)', color: '#a855f7',
                  '&:hover': { borderColor: '#a855f7', bgcolor: 'rgba(168,85,247,0.08)', boxShadow: '0 0 16px rgba(168,85,247,0.2)' },
                  '&:disabled': { borderColor: 'rgba(168,85,247,0.15)', color: '#475569' }
                }}>
                {demoRunning ? `Running... ${demoProgress}%` : '▶  Run Full Demo (7 Requests)'}
              </Button>

              {demoRunning && (
                <Box sx={{ mt: 1.5 }}>
                  <LinearProgress variant="determinate" value={demoProgress}
                    sx={{ borderRadius: 4, bgcolor: 'rgba(168,85,247,0.1)', height: 5,
                      '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #a855f7, #06b6d4)', borderRadius: 4 } }} />
                  <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block', textAlign: 'center' }}>
                    Firing {Math.ceil(demoProgress / 14.3)} of 7 requests...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Rules Card */}
          <Card sx={{ ...cardStyle, mb: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#e2e8f0' }}>📋 Rate Limit Rules</Typography>
              {[
                { label: 'Max Requests', value: '5 / window', color: '#a855f7' },
                { label: 'Window Size', value: '60 seconds', color: '#06b6d4' },
                { label: 'Algorithm', value: 'Sliding Window Log', color: '#ffd60a' },
                { label: 'Storage', value: 'Redis ZSET', color: '#f97316' },
                { label: 'Decision Latency', value: '< 10ms', color: '#00f5ff' },
                { label: 'Blocked Code', value: 'HTTP 429', color: '#ff4d6d' },
              ].map(item => (
                <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9, borderBottom: '1px solid rgba(168,85,247,0.07)' }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>{item.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: item.color, fontSize: '0.8rem' }}>{item.value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Stats Card */}
          {logs.length > 0 && (
            <Card sx={cardStyle}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#e2e8f0' }}>📊 Session Stats</Typography>
                  <Tooltip title="Clear all logs">
                    <IconButton size="small" onClick={() => { setLogs([]); requestNum.current = 0 }}
                      sx={{ color: '#475569', '&:hover': { color: '#ff4d6d' } }}>
                      <DeleteSweepIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Grid container spacing={1.5}>
                  {[
                    { label: 'Total', value: logs.length, color: '#a855f7', bg: 'rgba(168,85,247,0.08)' },
                    { label: 'Allowed', value: allowedCount, color: '#00f5ff', bg: 'rgba(0,245,255,0.08)' },
                    { label: 'Blocked', value: blockedCount, color: '#ff4d6d', bg: 'rgba(255,77,109,0.08)' },
                    { label: 'Avg Latency', value: `${Math.round(logs.reduce((a,b) => a+b.latency,0)/logs.length)}ms`, color: '#ffd60a', bg: 'rgba(255,214,10,0.08)' },
                  ].map(s => (
                    <Grid item xs={6} key={s.label}>
                      <Box sx={{ p: 1.5, bgcolor: s.bg, borderRadius: '10px', textAlign: 'center', border: `1px solid ${s.color}22` }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                        <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.68rem' }}>{s.label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Panel — Log */}
        <Grid item xs={12} md={8}>
          <Card sx={{ ...cardStyle, minHeight: 560 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#e2e8f0' }}>📡 Live Request / Response Log</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={`${allowedCount} Allowed`} size="small"
                    sx={{ bgcolor: 'rgba(0,245,255,0.08)', color: '#00f5ff', border: '1px solid rgba(0,245,255,0.2)', fontWeight: 700 }} />
                  <Chip label={`${blockedCount} Blocked`} size="small"
                    sx={{ bgcolor: 'rgba(255,77,109,0.08)', color: '#ff4d6d', border: '1px solid rgba(255,77,109,0.2)', fontWeight: 700 }} />
                </Box>
              </Box>
              <Divider sx={{ borderColor: 'rgba(168,85,247,0.1)', mb: 2 }} />

              {logs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                  <Typography sx={{ fontSize: '3.5rem', mb: 2 }}>🛡️</Typography>
                  <Typography variant="h6" sx={{ color: '#334155', fontWeight: 700 }}>Awaiting requests...</Typography>
                  <Typography variant="body2" sx={{ color: '#1e3a5f', mt: 1 }}>
                    Fire a request above — every HTTP call is logged here transparently
                  </Typography>
                  <Box sx={{ mt: 3, display: 'inline-flex', gap: 1 }}>
                    {['X-API-KEY header', 'Full request URL', 'Raw JSON response', 'Response time'].map(t => (
                      <Chip key={t} label={t} size="small"
                        sx={{ bgcolor: 'rgba(168,85,247,0.06)', color: '#475569', border: '1px solid rgba(168,85,247,0.1)', fontSize: '0.68rem' }} />
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ maxHeight: 680, overflowY: 'auto', pr: 0.5 }}>
                  <AnimatePresence>
                    {logs.map(entry => <RequestLog key={entry.requestNum} entry={entry} />)}
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