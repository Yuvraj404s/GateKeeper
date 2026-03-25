import React, { useState } from 'react'
import {
  Box, Grid, Typography, TextField, Button, Chip,
  Divider, IconButton, Tooltip, LinearProgress, Paper
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import SendIcon from '@mui/icons-material/Send'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import axios from 'axios'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const GATEWAY = '/api-gk/api/resource/data'

const codeStyle = {
  margin: 0, borderRadius: 0,
  fontSize: '0.76rem',
  background: '#1e1e1e',
  padding: '12px 16px',
  minHeight: 100,
}

function RequestEntry({ entry }) {
  const ok = entry.status === 200
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
      <Box sx={{ mb: 2, borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', bgcolor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

        {/* Entry header — Postman-style row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.2,
          bgcolor: ok ? '#f9fafb' : '#fff9f9', borderBottom: '1px solid #e5e7eb' }}>
          <span className="method-get">GET</span>
          <Typography sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#374151', flex: 1 }}>
            /api/resource/data
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span className={ok ? 'status-allowed' : 'status-blocked'}>
              <span className={`led ${ok ? 'led-green' : 'led-red'}`} />
              {entry.status} {ok ? 'OK' : 'TOO MANY REQUESTS'}
            </span>
            <Chip label={`${entry.latency}ms`} size="small"
              sx={{ bgcolor: '#f3f4f6', color: '#6b7280', fontSize: '0.7rem', height: 20, fontFamily: 'monospace', border: '1px solid #e5e7eb' }} />
            <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.68rem' }}>
              {new Date(entry.timestamp).toLocaleTimeString()}
            </Typography>
            <Chip label={`#${entry.requestNum}`} size="small"
              sx={{ bgcolor: '#f3f4f6', color: '#6b7280', fontSize: '0.68rem', height: 18 }} />
          </Box>
        </Box>

        {/* Two-panel: Request | Response */}
        <Grid container sx={{ minHeight: 120 }}>
          <Grid item xs={12} md={6} sx={{ borderRight: { md: '1px solid #2d2d2d' } }}>
            <div className="terminal-panel" style={{ borderRadius: 0, border: 'none', height: '100%' }}>
              <div className="title-bar">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
                <Typography sx={{ color: '#9ca3af', fontSize: '0.7rem', ml: 1, fontFamily: 'monospace' }}>request</Typography>
              </div>
              <SyntaxHighlighter language="bash" style={atomDark} customStyle={codeStyle}>
                {entry.requestSnippet}
              </SyntaxHighlighter>
            </div>
          </Grid>
          <Grid item xs={12} md={6}>
            <div className="terminal-panel" style={{ borderRadius: 0, border: 'none', height: '100%' }}>
              <div className="title-bar">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
                <Typography sx={{ color: '#9ca3af', fontSize: '0.7rem', ml: 1, fontFamily: 'monospace' }}>response · {entry.status}</Typography>
              </div>
              <SyntaxHighlighter language="json" style={atomDark} customStyle={codeStyle}>
                {entry.responseSnippet}
              </SyntaxHighlighter>
            </div>
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
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState(false)

  const sendRequest = async (key) => {
    const num = ++requestNum.current
    const t0 = Date.now()
    const k = key || apiKey || 'anon'
    const snippet = `curl -X GET http://localhost:8090/api/resource/data \\\n  -H "X-API-KEY: ${k}"`
    try {
      const res = await axios.get(GATEWAY, { headers: { 'X-API-KEY': k } })
      setLogs(p => [{ requestNum: num, status: 200, latency: Date.now()-t0, timestamp: Date.now(), requestSnippet: snippet, responseSnippet: JSON.stringify(res.data, null, 2) }, ...p])
    } catch (err) {
      const status = err.response?.status || 0
      setLogs(p => [{ requestNum: num, status, latency: Date.now()-t0, timestamp: Date.now(), requestSnippet: snippet, responseSnippet: JSON.stringify(err.response?.data || { error: 'failed' }, null, 2) }, ...p])
    }
  }

  const handleSingle = async () => { setLoading(true); await sendRequest(); setLoading(false) }
  const handleDemo = async () => {
    setDemoRunning(true); setProgress(0)
    const k = `demo-${Date.now()}`
    for (let i = 0; i < 7; i++) { await sendRequest(k); setProgress(Math.round((i+1)/7*100)); await new Promise(r => setTimeout(r, 420)) }
    setDemoRunning(false)
  }

  const allowed = logs.filter(l => l.status === 200).length
  const blocked = logs.filter(l => l.status !== 200).length
  const curl = `curl -X GET http://localhost:8090/api/resource/data \\\n  -H "X-API-KEY: ${apiKey}"`

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 56px)' }}>

      {/* LEFT SIDEBAR — Postman style */}
      <Box sx={{ width: 280, flexShrink: 0, bgcolor: '#2c2c2c', display: 'flex', flexDirection: 'column',
        borderRight: '1px solid #3a3a3a', overflowY: 'auto' }}>

        {/* Collection header */}
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #3a3a3a' }}>
          <Typography sx={{ color: '#e5e7eb', fontWeight: 700, fontSize: '0.85rem', mb: 0.3 }}>GateKeeper API</Typography>
          <Typography sx={{ color: '#6b7280', fontSize: '0.72rem' }}>Rate Limiter · 3 endpoints</Typography>
        </Box>

        {/* Endpoints list */}
        {[
          { method: 'POST', path: '/rate-limit/check', label: 'Check Rate Limit', active: false },
          { method: 'GET',  path: '/api/resource/data', label: 'Protected Resource', active: true },
          { method: 'GET',  path: '/analytics/blocked', label: 'Analytics Events', active: false },
        ].map(ep => (
          <Box key={ep.path} sx={{
            px: 2.5, py: 1.5,
            bgcolor: ep.active ? '#3a3a3a' : 'transparent',
            borderLeft: ep.active ? '2px solid #ef6c1a' : '2px solid transparent',
            cursor: 'pointer', '&:hover': { bgcolor: '#333' }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
              <Typography sx={{
                fontSize: '0.65rem', fontWeight: 800, fontFamily: 'monospace', px: 0.8, py: 0.2, borderRadius: '3px',
                color: ep.method === 'GET' ? '#4ade80' : '#fb923c',
                bgcolor: ep.method === 'GET' ? 'rgba(74,222,128,0.12)' : 'rgba(251,146,60,0.12)',
              }}>{ep.method}</Typography>
              <Typography sx={{ color: ep.active ? '#f9fafb' : '#9ca3af', fontSize: '0.75rem', fontWeight: ep.active ? 600 : 400 }}>
                {ep.label}
              </Typography>
            </Box>
            <Typography sx={{ color: '#4b5563', fontSize: '0.68rem', fontFamily: 'monospace', pl: 3.5 }}>{ep.path}</Typography>
          </Box>
        ))}

        <Divider sx={{ borderColor: '#3a3a3a', my: 1 }} />

        {/* Rate limit rules */}
        <Box sx={{ px: 2.5, py: 1.5 }}>
          <Typography sx={{ color: '#6b7280', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', mb: 1.5 }}>RATE LIMIT CONFIG</Typography>
          {[
            ['Max Requests', '5 / window'],
            ['Window', '60 seconds'],
            ['Algorithm', 'Sliding Window'],
            ['Backend', 'Redis ZSET'],
            ['On Exceed', 'HTTP 429'],
          ].map(([k, v]) => (
            <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ color: '#6b7280', fontSize: '0.72rem' }}>{k}</Typography>
              <Typography sx={{ color: '#d1d5db', fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 600 }}>{v}</Typography>
            </Box>
          ))}
        </Box>

        {/* Session stats */}
        {logs.length > 0 && (
          <>
            <Divider sx={{ borderColor: '#3a3a3a', my: 1 }} />
            <Box sx={{ px: 2.5, py: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography sx={{ color: '#6b7280', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em' }}>SESSION</Typography>
                <IconButton size="small" onClick={() => { setLogs([]); requestNum.current = 0 }}
                  sx={{ color: '#4b5563', p: 0.3, '&:hover': { color: '#ef4444' } }}>
                  <DeleteSweepIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Box>
              <Grid container spacing={1}>
                {[['Total', logs.length, '#e5e7eb'], ['Allowed', allowed, '#4ade80'], ['Blocked', blocked, '#f87171'],
                  ['Avg ms', `${Math.round(logs.reduce((a,b)=>a+b.latency,0)/logs.length)}`, '#fb923c']].map(([l,v,c]) => (
                  <Grid item xs={6} key={l}>
                    <Box sx={{ bgcolor: '#353535', borderRadius: '6px', p: 1, textAlign: 'center' }}>
                      <Typography sx={{ color: c, fontSize: '1.2rem', fontWeight: 900, lineHeight: 1 }}>{v}</Typography>
                      <Typography sx={{ color: '#4b5563', fontSize: '0.65rem', mt: 0.3 }}>{l}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}
      </Box>

      {/* RIGHT — Main workspace */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* URL Bar — Postman style top bar */}
        <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e5e7eb', px: 3, py: 1.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ bgcolor: '#fef3e8', color: '#ef6c1a', fontSize: '0.72rem', fontWeight: 800,
              fontFamily: 'monospace', px: 1.2, py: 0.5, borderRadius: '5px', border: '1px solid #fbd5b5' }}>GET</Box>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1,
              bgcolor: '#f9fafb', border: '1.5px solid #d1d5db', borderRadius: '7px', px: 1.5, py: 0.8 }}>
              <Typography sx={{ color: '#9ca3af', fontSize: '0.78rem', fontFamily: 'monospace' }}>localhost:8090</Typography>
              <Typography sx={{ color: '#d1d5db' }}>/</Typography>
              <Typography sx={{ color: '#111827', fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 600 }}>api/resource/data</Typography>
            </Box>
            <Button variant="contained" onClick={handleSingle} disabled={loading || demoRunning}
              startIcon={<SendIcon sx={{ fontSize: '16px !important' }} />}
              sx={{ px: 2.5, py: 0.9, fontSize: '0.82rem', bgcolor: '#ef6c1a', '&:hover': { bgcolor: '#d45f15' }, minWidth: 90 }}>
              {loading ? '...' : 'Send'}
            </Button>
            <Button variant="outlined" onClick={handleDemo} disabled={loading || demoRunning}
              startIcon={<PlayArrowIcon sx={{ fontSize: '16px !important' }} />}
              sx={{ px: 2, py: 0.9, fontSize: '0.82rem', borderColor: '#d1d5db', color: '#374151',
                '&:hover': { borderColor: '#ef6c1a', color: '#ef6c1a', bgcolor: '#fef3e8' } }}>
              {demoRunning ? `${progress}%` : 'Run Demo'}
            </Button>
          </Box>

          {/* Headers row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ color: '#9ca3af', fontSize: '0.72rem', fontWeight: 600 }}>HEADERS</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1,
              bgcolor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '5px', px: 1.5, py: 0.5 }}>
              <Typography sx={{ color: '#6b7280', fontSize: '0.72rem', fontFamily: 'monospace' }}>X-API-KEY:</Typography>
              <input
                value={apiKey} onChange={e => setApiKey(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', color: '#ef6c1a',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.76rem', fontWeight: 700, width: 160 }}
              />
            </Box>
            <Tooltip title={copied ? 'Copied!' : 'Copy curl'}>
              <IconButton size="small" onClick={() => { navigator.clipboard.writeText(curl); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
                sx={{ color: '#9ca3af', '&:hover': { color: '#ef6c1a' } }}>
                <ContentCopyIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Typography sx={{ color: '#9ca3af', fontSize: '0.68rem' }}>copy as curl</Typography>
            {demoRunning && <LinearProgress variant="determinate" value={progress}
              sx={{ flex: 1, height: 3, borderRadius: 2, bgcolor: '#f3f4f6',
                '& .MuiLinearProgress-bar': { bgcolor: '#ef6c1a' } }} />}
          </Box>
        </Box>

        {/* Tabs bar */}
        <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e5e7eb', px: 3, display: 'flex', gap: 0 }}>
          {['Response Log', 'Body', 'Headers'].map((t, i) => (
            <Typography key={t} sx={{
              px: 2, py: 1.2, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500,
              color: i === 0 ? '#ef6c1a' : '#9ca3af',
              borderBottom: i === 0 ? '2px solid #ef6c1a' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>{t}</Typography>
          ))}
          <Box sx={{ flex: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1 }}>
            <Chip label={`${allowed} 200`} size="small" sx={{ bgcolor: '#f0fdf4', color: '#15803d', border: '1px solid #86efac', fontSize: '0.68rem', height: 20 }} />
            <Chip label={`${blocked} 429`} size="small" sx={{ bgcolor: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5', fontSize: '0.68rem', height: 20 }} />
          </Box>
        </Box>

        {/* Log area */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: '#f3f4f6' }}>
          {logs.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
              <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center', maxWidth: 380 }}>
                <Typography sx={{ fontSize: '2rem', mb: 1 }}>🛡️</Typography>
                <Typography sx={{ fontWeight: 700, color: '#374151', mb: 0.5 }}>Hit Send to fire a request</Typography>
                <Typography sx={{ color: '#9ca3af', fontSize: '0.82rem', lineHeight: 1.6 }}>
                  Every request is logged here with the exact curl sent and raw JSON received — just like Postman, but wired into a live distributed system.
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.8, justifyContent: 'center' }}>
                  {['Request headers', 'Response body', 'Status code', 'Latency'].map(t => (
                    <Chip key={t} label={t} size="small" sx={{ bgcolor: '#f3f4f6', color: '#6b7280', fontSize: '0.68rem', border: '1px solid #e5e7eb' }} />
                  ))}
                </Box>
              </Box>
            </Box>
          ) : (
            <AnimatePresence>
              {logs.map(e => <RequestEntry key={e.requestNum} entry={e} />)}
            </AnimatePresence>
          )}
        </Box>
      </Box>
    </Box>
  )
}