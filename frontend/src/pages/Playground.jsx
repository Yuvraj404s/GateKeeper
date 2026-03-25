import React, { useState } from 'react'
import {
  Box, Container, Grid, Card, CardContent, Typography,
  Button, Chip, Divider, IconButton, Tooltip, LinearProgress, TextField
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import SendIcon from '@mui/icons-material/Send'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import axios from 'axios'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const GATEWAY = '/api-gk/api/resource/data'

function RequestCard({ entry }) {
  const ok = entry.status === 200
  return (
    <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}>
      <Box sx={{ mb:2, borderRadius:'10px', overflow:'hidden',
        border: `1px solid ${ok ? '#bbf7d0' : '#fecaca'}`,
        boxShadow: ok ? '0 2px 8px rgba(5,150,105,0.08)' : '0 2px 8px rgba(220,38,38,0.08)' }}>

        {/* Header */}
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          px:2.5, py:1.5, bgcolor: ok ? '#f0fdf4' : '#fef2f2',
          borderBottom: `1px solid ${ok ? '#bbf7d0' : '#fecaca'}` }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
            <span className={`led-wrap ${ok ? 'led-allowed' : 'led-blocked'}`}>
              <span className={`led-dot ${ok ? 'led-dot-g' : 'led-dot-r'}`} />
              {ok ? 'ALLOWED' : 'BLOCKED'}
            </span>
            <Typography sx={{ fontWeight:700, color:'#374151', fontSize:'0.85rem' }}>
              Request #{entry.requestNum}
            </Typography>
          </Box>
          <Box sx={{ display:'flex', gap:1, alignItems:'center' }}>
            <Chip label={`HTTP ${entry.status}`} size="small"
              sx={{ bgcolor: ok?'#dcfce7':'#fee2e2', color: ok?'#166534':'#991b1b',
                fontWeight:700, fontSize:'0.72rem', border:`1px solid ${ok?'#86efac':'#fca5a5'}` }} />
            <Chip label={`${entry.latency}ms`} size="small"
              sx={{ bgcolor:'#fefce8', color:'#854d0e', fontWeight:700, fontSize:'0.72rem', border:'1px solid #fde68a' }} />
            <Typography sx={{ color:'#94a3b8', fontSize:'0.72rem' }}>
              {new Date(entry.timestamp).toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>

        {/* Two panels */}
        <Grid container sx={{ bgcolor:'#fff' }}>
          <Grid item xs={12} md={6} sx={{ borderRight:{ md:'1px solid #1e2a3a' } }}>
            <Box sx={{ bgcolor:'#1a2332' }}>
              <Box sx={{ px:2, py:1, display:'flex', alignItems:'center', gap:1.5,
                borderBottom:'1px solid #243447', bgcolor:'#1e2a3a' }}>
                <div className="win-dots">
                  <span className="dot dot-r"/><span className="dot dot-y"/><span className="dot dot-g"/>
                </div>
                <Typography sx={{ color:'#64748b', fontSize:'0.7rem', fontFamily:'monospace' }}>request.sh</Typography>
              </Box>
              <SyntaxHighlighter language="bash" style={atomDark}
                customStyle={{ margin:0, borderRadius:0, fontSize:'0.75rem', background:'#1a2332', padding:'14px 16px', minHeight:90 }}>
                {entry.requestSnippet}
              </SyntaxHighlighter>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor:'#1a2332' }}>
              <Box sx={{ px:2, py:1, display:'flex', alignItems:'center', gap:1.5,
                borderBottom:'1px solid #243447', bgcolor:'#1e2a3a' }}>
                <div className="win-dots">
                  <span className="dot dot-r"/><span className="dot dot-y"/><span className="dot dot-g"/>
                </div>
                <Typography sx={{ color:'#64748b', fontSize:'0.7rem', fontFamily:'monospace' }}>
                  response · {entry.status}
                </Typography>
              </Box>
              <SyntaxHighlighter language="json" style={atomDark}
                customStyle={{ margin:0, borderRadius:0, fontSize:'0.75rem', background:'#1a2332', padding:'14px 16px', minHeight:90 }}>
                {entry.responseSnippet}
              </SyntaxHighlighter>
            </Box>
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
      setLogs(p => [{ requestNum:num, status:200, latency:Date.now()-t0, timestamp:Date.now(), requestSnippet:snippet, responseSnippet:JSON.stringify(res.data,null,2) }, ...p])
    } catch(err) {
      const status = err.response?.status || 0
      setLogs(p => [{ requestNum:num, status, latency:Date.now()-t0, timestamp:Date.now(), requestSnippet:snippet, responseSnippet:JSON.stringify(err.response?.data||{error:'failed'},null,2) }, ...p])
    }
  }

  const handleSingle = async () => { setLoading(true); await sendRequest(); setLoading(false) }
  const handleDemo = async () => {
    setDemoRunning(true); setProgress(0)
    const k = `demo-${Date.now()}`
    for(let i=0;i<7;i++){ await sendRequest(k); setProgress(Math.round((i+1)/7*100)); await new Promise(r=>setTimeout(r,420)) }
    setDemoRunning(false)
  }

  const allowed = logs.filter(l=>l.status===200).length
  const blocked = logs.filter(l=>l.status!==200).length

  return (
    <Container maxWidth="xl" sx={{ py:4 }}>

      {/* Page title */}
      <Box sx={{ mb:3 }}>
        <Typography variant="h5" sx={{ fontWeight:800, color:'#0f172a', mb:0.5 }}>
          ⚡ Rate Limiter Playground
        </Typography>
        <Typography sx={{ color:'#64748b', fontSize:'0.9rem' }}>
          Send real HTTP requests through GateKeeper's API Gateway. See the exact request sent and raw response received — every time.
        </Typography>
      </Box>

      <Grid container spacing={3}>

        {/* LEFT — Config */}
        <Grid item xs={12} md={4}>

          {/* API Key + Send */}
          <Card sx={{ mb:2 }}>
            <CardContent sx={{ p:3 }}>
              <Typography sx={{ fontWeight:700, color:'#0f172a', fontSize:'0.9rem', mb:2 }}>
                🔑 Configure Request
              </Typography>

              <Box sx={{ mb:2, p:2, bgcolor:'#f8f9fc', borderRadius:'8px', border:'1px solid #e2e8f0' }}>
                <Typography sx={{ fontSize:'0.68rem', fontWeight:700, color:'#94a3b8', letterSpacing:'0.06em', mb:1 }}>
                  HEADER
                </Typography>
                <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                  <Typography sx={{ fontFamily:'monospace', fontSize:'0.78rem', color:'#64748b', whiteSpace:'nowrap' }}>
                    X-API-KEY:
                  </Typography>
                  <input value={apiKey} onChange={e=>setApiKey(e.target.value)}
                    style={{ border:'none', outline:'none', background:'transparent',
                      fontFamily:'JetBrains Mono, monospace', fontSize:'0.82rem',
                      fontWeight:700, color:'#7c3aed', width:'100%' }} />
                </Box>
              </Box>

              <Box sx={{ mb:2, p:2, bgcolor:'#1a2332', borderRadius:'8px', position:'relative' }}>
                <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:1 }}>
                  <Typography sx={{ fontSize:'0.65rem', fontWeight:700, color:'#475569', letterSpacing:'0.08em' }}>CURL EQUIVALENT</Typography>
                  <Tooltip title={copied?'Copied!':'Copy'}>
                    <IconButton size="small" onClick={()=>{ navigator.clipboard.writeText(`curl -X GET http://localhost:8090/api/resource/data -H "X-API-KEY: ${apiKey}"`); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
                      sx={{ color: copied?'#22c55e':'#475569', p:0.4 }}>
                      <ContentCopyIcon sx={{ fontSize:14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography sx={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.72rem', color:'#94a3b8', lineHeight:1.7, whiteSpace:'pre' }}>
                  {`curl -X GET \
  localhost:8090/api/resource/data \
  -H "X-API-KEY: ${apiKey}"`}
                </Typography>
              </Box>

              <Button fullWidth variant="contained" startIcon={<SendIcon sx={{fontSize:'16px !important'}}/>}
                onClick={handleSingle} disabled={loading||demoRunning}
                sx={{ mb:1.5, py:1.2, bgcolor:'#7c3aed', fontSize:'0.88rem',
                  '&:hover':{ bgcolor:'#6d28d9' }, '&:disabled':{ bgcolor:'#e2e8f0', color:'#94a3b8' } }}>
                {loading ? 'Sending...' : 'Fire Single Request'}
              </Button>

              <Button fullWidth variant="outlined" startIcon={<PlayArrowIcon sx={{fontSize:'16px !important'}}/>}
                onClick={handleDemo} disabled={loading||demoRunning}
                sx={{ py:1.2, fontSize:'0.88rem', borderColor:'#c4b5fd', color:'#7c3aed',
                  '&:hover':{ borderColor:'#7c3aed', bgcolor:'#f5f3ff' } }}>
                {demoRunning ? `Running... ${progress}%` : 'Run Full Demo  (7 requests)'}
              </Button>

              {demoRunning && <LinearProgress variant="determinate" value={progress}
                sx={{ mt:1.5, height:4, borderRadius:2, bgcolor:'#f1f5f9',
                  '& .MuiLinearProgress-bar':{ bgcolor:'#7c3aed', borderRadius:2 } }} />}
            </CardContent>
          </Card>

          {/* Rules */}
          <Card sx={{ mb:2 }}>
            <CardContent sx={{ p:3 }}>
              <Typography sx={{ fontWeight:700, color:'#0f172a', fontSize:'0.9rem', mb:2 }}>📋 Rate Limit Config</Typography>
              {[
                ['Max Requests', '5', 'per 60s window'],
                ['Algorithm',   'Sliding Window Log', ''],
                ['Storage',     'Redis ZSET', 'O(log N)'],
                ['Blocked →',   'HTTP 429', 'Too Many Requests'],
                ['Decision',    '< 10ms', 'avg latency'],
              ].map(([k,v,hint])=>(
                <Box key={k} sx={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', py:1, borderBottom:'1px solid #f1f5f9' }}>
                  <Typography sx={{ color:'#64748b', fontSize:'0.8rem' }}>{k}</Typography>
                  <Box sx={{ textAlign:'right' }}>
                    <Typography sx={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.8rem', fontWeight:700, color:'#0f172a' }}>{v}</Typography>
                    {hint && <Typography sx={{ fontSize:'0.65rem', color:'#94a3b8' }}>{hint}</Typography>}
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Session stats */}
          {logs.length > 0 && (
            <Card>
              <CardContent sx={{ p:3 }}>
                <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
                  <Typography sx={{ fontWeight:700, color:'#0f172a', fontSize:'0.9rem' }}>📊 This Session</Typography>
                  <Tooltip title="Clear logs">
                    <IconButton size="small" onClick={()=>{ setLogs([]); requestNum.current=0 }}
                      sx={{ color:'#94a3b8', '&:hover':{ color:'#dc2626' } }}>
                      <DeleteSweepIcon sx={{ fontSize:17 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Grid container spacing={1.5}>
                  {[
                    { label:'Total',   value:logs.length, color:'#7c3aed', bg:'#f5f3ff' },
                    { label:'Allowed', value:allowed,     color:'#059669', bg:'#f0fdf4' },
                    { label:'Blocked', value:blocked,     color:'#dc2626', bg:'#fef2f2' },
                    { label:'Avg ms',  value:`${Math.round(logs.reduce((a,b)=>a+b.latency,0)/logs.length)}`, color:'#b45309', bg:'#fffbeb' },
                  ].map(s=>(
                    <Grid item xs={6} key={s.label}>
                      <Box sx={{ p:1.5, bgcolor:s.bg, borderRadius:'8px', textAlign:'center' }}>
                        <Typography sx={{ fontSize:'1.6rem', fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</Typography>
                        <Typography sx={{ fontSize:'0.68rem', color:'#94a3b8', mt:0.4 }}>{s.label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* RIGHT — Live log */}
        <Grid item xs={12} md={8}>
          <Card sx={{ minHeight:500 }}>
            <CardContent sx={{ p:3 }}>
              <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
                <Box>
                  <Typography sx={{ fontWeight:700, color:'#0f172a', fontSize:'0.9rem' }}>📡 Live Request / Response Log</Typography>
                  <Typography sx={{ color:'#94a3b8', fontSize:'0.75rem', mt:0.3 }}>
                    Every request shows the exact HTTP call made and the raw response from GateKeeper
                  </Typography>
                </Box>
                <Box sx={{ display:'flex', gap:1 }}>
                  <Chip label={`${allowed} allowed`} size="small"
                    sx={{ bgcolor:'#f0fdf4', color:'#166534', border:'1px solid #bbf7d0', fontWeight:700, fontSize:'0.72rem' }} />
                  <Chip label={`${blocked} blocked`} size="small"
                    sx={{ bgcolor:'#fef2f2', color:'#991b1b', border:'1px solid #fecaca', fontWeight:700, fontSize:'0.72rem' }} />
                </Box>
              </Box>
              <Divider sx={{ mb:2.5, borderColor:'#f1f5f9' }} />

              {logs.length === 0 ? (
                <Box sx={{ textAlign:'center', py:10 }}>
                  <Typography sx={{ fontSize:'3rem', mb:2 }}>🛡️</Typography>
                  <Typography sx={{ fontWeight:700, color:'#374151', fontSize:'1rem', mb:0.8 }}>
                    No requests fired yet
                  </Typography>
                  <Typography sx={{ color:'#94a3b8', fontSize:'0.85rem', mb:3, maxWidth:360, mx:'auto' }}>
                    Enter an API key and fire a single request — or run the full 7-request demo to watch the rate limiter block requests 6 and 7.
                  </Typography>
                  <Box sx={{ display:'inline-flex', gap:1, flexWrap:'wrap', justifyContent:'center' }}>
                    {['Shows exact curl command','Raw JSON response','HTTP status code','Response latency'].map(t=>(
                      <Chip key={t} label={t} size="small"
                        sx={{ bgcolor:'#f8f9fc', color:'#64748b', border:'1px solid #e2e8f0', fontSize:'0.72rem' }} />
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ maxHeight:680, overflowY:'auto', pr:0.5 }}>
                  <AnimatePresence>
                    {logs.map(e=><RequestCard key={e.requestNum} entry={e}/>)}
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