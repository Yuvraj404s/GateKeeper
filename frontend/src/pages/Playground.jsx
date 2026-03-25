import React, { useState } from 'react'
import {
  Box, Container, Grid, Card, CardContent, Typography,
  Button, Chip, Divider, IconButton, Tooltip, LinearProgress
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import SendIcon from '@mui/icons-material/Send'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import axios from 'axios'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const GATEWAY = '/api-gk/api/resource/data'

const glass = {
  background:'rgba(255,255,255,0.04)',
  backdropFilter:'blur(20px)',
  border:'1px solid rgba(255,255,255,0.08)',
  borderRadius:'12px',
  boxShadow:'0 4px 24px rgba(0,0,0,0.3)',
}

function RequestCard({ entry }) {
  const ok = entry.status === 200
  return (
    <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.28 }}>
      <Box sx={{ mb:2, borderRadius:'10px', overflow:'hidden',
        border:`1px solid ${ok?'rgba(52,211,153,0.2)':'rgba(248,113,113,0.2)'}`,
        boxShadow: ok?'0 2px 12px rgba(52,211,153,0.06)':'0 2px 12px rgba(248,113,113,0.06)',
        background:'rgba(255,255,255,0.03)' }}>

        {/* Row header */}
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          px:2.5, py:1.5,
          background: ok?'rgba(52,211,153,0.06)':'rgba(248,113,113,0.06)',
          borderBottom:`1px solid ${ok?'rgba(52,211,153,0.12)':'rgba(248,113,113,0.12)'}` }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
            <span className={`led-wrap ${ok?'led-allowed':'led-blocked'}`}>
              <span className={`led-dot ${ok?'led-dot-g':'led-dot-r'}`}/>
              {ok ? 'ALLOWED' : 'BLOCKED'}
            </span>
            <Typography sx={{ fontWeight:700, color:'#cbd5e1', fontSize:'0.85rem' }}>
              Request #{entry.requestNum}
            </Typography>
          </Box>
          <Box sx={{ display:'flex', gap:1, alignItems:'center' }}>
            <Chip label={`HTTP ${entry.status}`} size="small" sx={{
              bgcolor: ok?'rgba(52,211,153,0.1)':'rgba(248,113,113,0.1)',
              color: ok?'#6ee7b7':'#fca5a5',
              border:`1px solid ${ok?'rgba(52,211,153,0.25)':'rgba(248,113,113,0.25)'}`,
              fontWeight:700, fontSize:'0.7rem' }} />
            <Chip label={`${entry.latency}ms`} size="small" sx={{
              bgcolor:'rgba(251,191,36,0.08)', color:'#fbbf24',
              border:'1px solid rgba(251,191,36,0.2)', fontWeight:700, fontSize:'0.7rem' }} />
            <Typography sx={{ color:'#475569', fontSize:'0.7rem' }}>
              {new Date(entry.timestamp).toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>

        {/* Code panels */}
        <Grid container>
          <Grid item xs={12} md={6} sx={{ borderRight:{md:'1px solid #1e2d3d'} }}>
            <Box sx={{ background:'#0d1520' }}>
              <Box sx={{ px:2, py:1, borderBottom:'1px solid #1e2d3d', display:'flex', alignItems:'center', gap:1.5, background:'#111c2b' }}>
                <div className="win-dots"><span className="dot dot-r"/><span className="dot dot-y"/><span className="dot dot-g"/></div>
                <Typography sx={{ color:'#334155', fontSize:'0.68rem', fontFamily:'monospace' }}>request.sh</Typography>
              </Box>
              <SyntaxHighlighter language="bash" style={atomDark}
                customStyle={{ margin:0, borderRadius:0, fontSize:'0.74rem', background:'#0d1520', padding:'14px 16px', minHeight:90 }}>
                {entry.requestSnippet}
              </SyntaxHighlighter>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ background:'#0d1520' }}>
              <Box sx={{ px:2, py:1, borderBottom:'1px solid #1e2d3d', display:'flex', alignItems:'center', gap:1.5, background:'#111c2b' }}>
                <div className="win-dots"><span className="dot dot-r"/><span className="dot dot-y"/><span className="dot dot-g"/></div>
                <Typography sx={{ color:'#334155', fontSize:'0.68rem', fontFamily:'monospace' }}>response · {entry.status}</Typography>
              </Box>
              <SyntaxHighlighter language="json" style={atomDark}
                customStyle={{ margin:0, borderRadius:0, fontSize:'0.74rem', background:'#0d1520', padding:'14px 16px', minHeight:90 }}>
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
      const res = await axios.get(GATEWAY, { headers:{'X-API-KEY':k} })
      setLogs(p=>[{requestNum:num,status:200,latency:Date.now()-t0,timestamp:Date.now(),requestSnippet:snippet,responseSnippet:JSON.stringify(res.data,null,2)},...p])
    } catch(err) {
      const status = err.response?.status||0
      setLogs(p=>[{requestNum:num,status,latency:Date.now()-t0,timestamp:Date.now(),requestSnippet:snippet,responseSnippet:JSON.stringify(err.response?.data||{error:'failed'},null,2)},...p])
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
      <Box sx={{ mb:3 }}>
        <Typography variant="h5" sx={{ fontWeight:800, color:'#f1f5f9', mb:0.5 }}>⚡ Rate Limiter Playground</Typography>
        <Typography sx={{ color:'#64748b', fontSize:'0.9rem' }}>
          Send real HTTP requests through GateKeeper — see the exact request sent and raw response received every time.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* LEFT */}
        <Grid item xs={12} md={4}>
          <Box sx={{ ...glass, mb:2, p:3 }}>
            <Typography sx={{ fontWeight:700, color:'#f1f5f9', fontSize:'0.9rem', mb:2 }}>🔑 Configure Request</Typography>

            {/* Key input */}
            <Box sx={{ mb:2.5, p:2, background:'rgba(0,0,0,0.25)', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.06)' }}>
              <Typography sx={{ fontSize:'0.65rem', fontWeight:700, color:'#475569', letterSpacing:'0.08em', mb:1 }}>X-API-KEY HEADER</Typography>
              <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                <Typography sx={{ fontFamily:'monospace', fontSize:'0.75rem', color:'#475569', whiteSpace:'nowrap' }}>value:</Typography>
                <input value={apiKey} onChange={e=>setApiKey(e.target.value)} style={{
                  border:'none', outline:'none', background:'transparent',
                  fontFamily:'JetBrains Mono, monospace', fontSize:'0.82rem',
                  fontWeight:700, color:'#38bdf8', width:'100%' }} />
              </Box>
            </Box>

            {/* Curl preview */}
            <Box sx={{ mb:2.5, background:'#0d1520', borderRadius:'8px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.06)' }}>
              <Box sx={{ px:2, py:1, display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #1e2d3d', background:'#111c2b' }}>
                <Typography sx={{ fontSize:'0.65rem', fontWeight:700, color:'#334155', letterSpacing:'0.08em' }}>CURL EQUIVALENT</Typography>
                <Tooltip title={copied?'Copied!':'Copy'}>
                  <IconButton size="small" onClick={()=>{navigator.clipboard.writeText(`curl -X GET http://localhost:8090/api/resource/data -H "X-API-KEY: ${apiKey}"`);setCopied(true);setTimeout(()=>setCopied(false),2000)}}
                    sx={{ color:copied?'#34d399':'#475569', p:0.4 }}>
                    <ContentCopyIcon sx={{ fontSize:14 }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography sx={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.72rem', color:'#7dd3fc',
                px:2, py:1.5, lineHeight:1.8, whiteSpace:'pre' }}>
                {`curl -X GET \
  localhost:8090/api/resource/data \
  -H "X-API-KEY: ${apiKey}"`}
              </Typography>
            </Box>

            <Button fullWidth variant="contained" startIcon={<SendIcon sx={{fontSize:'15px !important'}}/>}
              onClick={handleSingle} disabled={loading||demoRunning}
              sx={{ mb:1.5, py:1.2, fontSize:'0.88rem', fontWeight:700,
                bgcolor:'#38bdf8', color:'#0c1a27',
                '&:hover':{ bgcolor:'#7dd3fc' } }}>
              {loading ? 'Sending...' : 'Fire Single Request'}
            </Button>

            <Button fullWidth variant="outlined" startIcon={<PlayArrowIcon sx={{fontSize:'15px !important'}}/>}
              onClick={handleDemo} disabled={loading||demoRunning}
              sx={{ py:1.2, fontSize:'0.88rem',
                borderColor:'rgba(56,189,248,0.3)', color:'#38bdf8',
                '&:hover':{ borderColor:'#38bdf8', bgcolor:'rgba(56,189,248,0.06)' } }}>
              {demoRunning ? `Running... ${progress}%` : 'Run Full Demo  (7 requests)'}
            </Button>

            {demoRunning && <LinearProgress variant="determinate" value={progress}
              sx={{ mt:1.5, height:3, borderRadius:2, bgcolor:'rgba(255,255,255,0.05)',
                '& .MuiLinearProgress-bar':{ bgcolor:'#38bdf8', borderRadius:2 } }} />}
          </Box>

          {/* Rules */}
          <Box sx={{ ...glass, mb:2, p:3 }}>
            <Typography sx={{ fontWeight:700, color:'#f1f5f9', fontSize:'0.9rem', mb:2 }}>📋 Rate Limit Config</Typography>
            {[
              ['Max Requests','5 / window'],['Window Size','60 seconds'],
              ['Algorithm','Sliding Window Log'],['Storage','Redis ZSET'],
              ['Blocked Code','HTTP 429'],['Decision','< 10ms'],
            ].map(([k,v])=>(
              <Box key={k} sx={{ display:'flex', justifyContent:'space-between', py:0.9, borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <Typography sx={{ color:'#64748b', fontSize:'0.8rem' }}>{k}</Typography>
                <Typography sx={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.8rem', fontWeight:700, color:'#cbd5e1' }}>{v}</Typography>
              </Box>
            ))}
          </Box>

          {/* Session stats */}
          {logs.length > 0 && (
            <Box sx={{ ...glass, p:3 }}>
              <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
                <Typography sx={{ fontWeight:700, color:'#f1f5f9', fontSize:'0.9rem' }}>📊 Session</Typography>
                <Tooltip title="Clear"><IconButton size="small" onClick={()=>{setLogs([]);requestNum.current=0}}
                  sx={{ color:'#475569','&:hover':{color:'#f87171'} }}><DeleteSweepIcon sx={{fontSize:17}}/></IconButton></Tooltip>
              </Box>
              <Grid container spacing={1.5}>
                {[
                  ['Total',logs.length,'#38bdf8','rgba(56,189,248,0.08)'],
                  ['Allowed',allowed,'#34d399','rgba(52,211,153,0.08)'],
                  ['Blocked',blocked,'#f87171','rgba(248,113,113,0.08)'],
                  ['Avg ms',`${Math.round(logs.reduce((a,b)=>a+b.latency,0)/logs.length)}`,'#fbbf24','rgba(251,191,36,0.08)'],
                ].map(([l,v,c,bg])=>(
                  <Grid item xs={6} key={l}>
                    <Box sx={{ p:1.5, bgcolor:bg, borderRadius:'8px', textAlign:'center', border:`1px solid ${c}18` }}>
                      <Typography sx={{ fontSize:'1.6rem', fontWeight:900, color:c, lineHeight:1 }}>{v}</Typography>
                      <Typography sx={{ fontSize:'0.68rem', color:'#475569', mt:0.4 }}>{l}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Grid>

        {/* RIGHT — Log */}
        <Grid item xs={12} md={8}>
          <Box sx={{ ...glass, minHeight:500, p:3 }}>
            <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
              <Box>
                <Typography sx={{ fontWeight:700, color:'#f1f5f9', fontSize:'0.9rem' }}>📡 Live Request / Response Log</Typography>
                <Typography sx={{ color:'#475569', fontSize:'0.75rem', mt:0.3 }}>Every call shows the exact HTTP request sent and raw JSON response received</Typography>
              </Box>
              <Box sx={{ display:'flex', gap:1 }}>
                <Chip label={`${allowed} allowed`} size="small" sx={{ bgcolor:'rgba(52,211,153,0.1)', color:'#6ee7b7', border:'1px solid rgba(52,211,153,0.2)', fontWeight:700, fontSize:'0.72rem' }} />
                <Chip label={`${blocked} blocked`} size="small" sx={{ bgcolor:'rgba(248,113,113,0.1)', color:'#fca5a5', border:'1px solid rgba(248,113,113,0.2)', fontWeight:700, fontSize:'0.72rem' }} />
              </Box>
            </Box>
            <Divider sx={{ borderColor:'rgba(255,255,255,0.06)', mb:2.5 }} />

            {logs.length === 0 ? (
              <Box sx={{ textAlign:'center', py:10 }}>
                <Typography sx={{ fontSize:'3rem', mb:2 }}>🛡️</Typography>
                <Typography sx={{ fontWeight:700, color:'#94a3b8', mb:0.8 }}>No requests fired yet</Typography>
                <Typography sx={{ color:'#334155', fontSize:'0.85rem', maxWidth:360, mx:'auto' }}>
                  Set your API key and hit "Fire Single Request" — or run the demo to watch the sliding window block requests 6 and 7.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ maxHeight:680, overflowY:'auto', pr:0.5 }}>
                <AnimatePresence>{logs.map(e=><RequestCard key={e.requestNum} entry={e}/>)}</AnimatePresence>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}