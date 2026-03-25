import React, { useState } from 'react'
import { Box, Container, Grid, Card, CardContent, Typography,
  Button, Chip, Divider, IconButton, Tooltip, LinearProgress } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import SendIcon from '@mui/icons-material/Send'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import axios from 'axios'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const GATEWAY = '/api-gk/api/resource/data'
const codeStyle = { margin:0, borderRadius:0, fontSize:'0.74rem', background:'#09090b', padding:'14px 16px', minHeight:100 }

function RequestCard({ entry }) {
  const ok = entry.status === 200
  return (
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} transition={{duration:0.28}}>
      <Box sx={{ mb:2, borderRadius:'10px', overflow:'hidden',
        border:`1px solid ${ok?'#166534':'#7f1d1d'}`,
        bgcolor:'#27272a' }}>
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          px:2.5, py:1.4,
          bgcolor: ok ? '#14532d' : '#450a0a',
          borderBottom:`1px solid ${ok?'#166534':'#7f1d1d'}` }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
            <span className={`led-wrap ${ok?'led-allowed':'led-blocked'}`}>
              <span className={`led-dot ${ok?'led-g':'led-r'}`}/>{ok?'ALLOWED':'BLOCKED'}
            </span>
            <Typography sx={{ fontWeight:700, color:'#d4d4d8', fontSize:'0.84rem' }}>
              Request #{entry.requestNum}
            </Typography>
          </Box>
          <Box sx={{ display:'flex', gap:1, alignItems:'center' }}>
            <Chip label={`HTTP ${entry.status}`} size="small" sx={{
              bgcolor: ok?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)',
              color: ok?'#86efac':'#fca5a5',
              border:`1px solid ${ok?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'}`,
              fontWeight:700, fontSize:'0.7rem' }}/>
            <Chip label={`${entry.latency}ms`} size="small" sx={{
              bgcolor:'rgba(234,179,8,0.1)', color:'#fde047',
              border:'1px solid rgba(234,179,8,0.2)', fontWeight:700, fontSize:'0.7rem' }}/>
            <Typography sx={{ color:'#52525b', fontSize:'0.7rem' }}>
              {new Date(entry.timestamp).toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
        <Grid container>
          <Grid item xs={12} md={6} sx={{ borderRight:{md:'1px solid #3f3f46'} }}>
            <Box sx={{ background:'#09090b' }}>
              <Box sx={{ px:2, py:1, bgcolor:'#18181b', borderBottom:'1px solid #27272a', display:'flex', alignItems:'center', gap:1.5 }}>
                <div className="win-dots"><span className="dot dot-r"/><span className="dot dot-y"/><span className="dot dot-g"/></div>
                <Typography sx={{ color:'#3f3f46', fontSize:'0.68rem', fontFamily:'monospace' }}>request.sh</Typography>
              </Box>
              <SyntaxHighlighter language="bash" style={atomDark} customStyle={codeStyle}>{entry.requestSnippet}</SyntaxHighlighter>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ background:'#09090b' }}>
              <Box sx={{ px:2, py:1, bgcolor:'#18181b', borderBottom:'1px solid #27272a', display:'flex', alignItems:'center', gap:1.5 }}>
                <div className="win-dots"><span className="dot dot-r"/><span className="dot dot-y"/><span className="dot dot-g"/></div>
                <Typography sx={{ color:'#3f3f46', fontSize:'0.68rem', fontFamily:'monospace' }}>response · {entry.status}</Typography>
              </Box>
              <SyntaxHighlighter language="json" style={atomDark} customStyle={codeStyle}>{entry.responseSnippet}</SyntaxHighlighter>
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
    const num = ++requestNum.current; const t0 = Date.now(); const k = key||apiKey||'anon'
    const snippet = `curl -X GET http://localhost:8090/api/resource/data \\\n  -H "X-API-KEY: ${k}"`
    try {
      const res = await axios.get(GATEWAY, {headers:{'X-API-KEY':k}})
      setLogs(p=>[{requestNum:num,status:200,latency:Date.now()-t0,timestamp:Date.now(),requestSnippet:snippet,responseSnippet:JSON.stringify(res.data,null,2)},...p])
    } catch(err) {
      setLogs(p=>[{requestNum:num,status:err.response?.status||0,latency:Date.now()-t0,timestamp:Date.now(),requestSnippet:snippet,responseSnippet:JSON.stringify(err.response?.data||{error:'failed'},null,2)},...p])
    }
  }
  const handleSingle = async()=>{ setLoading(true); await sendRequest(); setLoading(false) }
  const handleDemo = async()=>{
    setDemoRunning(true); setProgress(0); const k=`demo-${Date.now()}`
    for(let i=0;i<7;i++){ await sendRequest(k); setProgress(Math.round((i+1)/7*100)); await new Promise(r=>setTimeout(r,420)) }
    setDemoRunning(false)
  }
  const allowed = logs.filter(l=>l.status===200).length
  const blocked = logs.filter(l=>l.status!==200).length

  return (
    <Container maxWidth="xl" sx={{ py:4 }}>
      <Box sx={{ mb:3 }}>
        <Typography variant="h5" sx={{ fontWeight:800, color:'#e4e4e7', mb:0.5 }}>⚡ Rate Limiter Playground</Typography>
        <Typography sx={{ color:'#71717a', fontSize:'0.88rem' }}>
          Send real HTTP requests through GateKeeper's Gateway — see the exact request and raw response every time.
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ mb:2 }}>
            <CardContent sx={{ p:3 }}>
              <Typography sx={{ fontWeight:700, color:'#e4e4e7', fontSize:'0.88rem', mb:2 }}>🔑 Configure Request</Typography>
              <Box sx={{ mb:2, p:2, bgcolor:'#18181b', borderRadius:'8px', border:'1px solid #3f3f46' }}>
                <Typography sx={{ fontSize:'0.65rem', fontWeight:700, color:'#52525b', letterSpacing:'0.08em', mb:1 }}>X-API-KEY</Typography>
                <input value={apiKey} onChange={e=>setApiKey(e.target.value)} style={{
                  border:'none', outline:'none', background:'transparent',
                  fontFamily:'JetBrains Mono, monospace', fontSize:'0.82rem',
                  fontWeight:700, color:'#fb923c', width:'100%' }}/>
              </Box>
              <Box sx={{ mb:2.5, bgcolor:'#09090b', borderRadius:'8px', overflow:'hidden', border:'1px solid #3f3f46' }}>
                <Box sx={{ px:2, py:1, bgcolor:'#18181b', borderBottom:'1px solid #27272a', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <Typography sx={{ fontSize:'0.63rem', fontWeight:700, color:'#52525b', letterSpacing:'0.08em' }}>CURL EQUIVALENT</Typography>
                  <Tooltip title={copied?'Copied!':'Copy'}>
                    <IconButton size="small" onClick={()=>{navigator.clipboard.writeText(`curl -X GET http://localhost:8090/api/resource/data -H "X-API-KEY: ${apiKey}"`);setCopied(true);setTimeout(()=>setCopied(false),2000)}}
                      sx={{ color:copied?'#22c55e':'#52525b', p:0.3 }}>
                      <ContentCopyIcon sx={{ fontSize:13 }}/>
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography sx={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.71rem', color:'#a1a1aa',
                  px:2, py:1.5, lineHeight:1.9, whiteSpace:'pre' }}>
                  {`curl -X GET \
  localhost:8090/api/resource/data \
  -H "X-API-KEY: ${apiKey}"`}
                </Typography>
              </Box>
              <Button fullWidth variant="contained" startIcon={<SendIcon sx={{fontSize:'15px !important'}}/>}
                onClick={handleSingle} disabled={loading||demoRunning}
                sx={{ mb:1.5, py:1.2, fontSize:'0.87rem' }}>
                {loading?'Sending...':'Fire Single Request'}
              </Button>
              <Button fullWidth variant="outlined" startIcon={<PlayArrowIcon sx={{fontSize:'15px !important'}}/>}
                onClick={handleDemo} disabled={loading||demoRunning}
                sx={{ py:1.2, fontSize:'0.87rem', borderColor:'#3f3f46', color:'#a1a1aa',
                  '&:hover':{ borderColor:'#f97316', color:'#f97316', bgcolor:'rgba(249,115,22,0.05)' } }}>
                {demoRunning?`Running... ${progress}%`:'Run Full Demo  (7 requests)'}
              </Button>
              {demoRunning && <LinearProgress variant="determinate" value={progress}
                sx={{ mt:1.5, height:3, borderRadius:2, bgcolor:'#3f3f46',
                  '& .MuiLinearProgress-bar':{ bgcolor:'#f97316' } }}/>}
            </CardContent>
          </Card>

          <Card sx={{ mb:2 }}>
            <CardContent sx={{ p:3 }}>
              <Typography sx={{ fontWeight:700, color:'#e4e4e7', fontSize:'0.88rem', mb:2 }}>📋 Rate Limit Config</Typography>
              {[['Max Requests','5 / window'],['Window','60 seconds'],['Algorithm','Sliding Window Log'],
                ['Storage','Redis ZSET'],['Blocked','HTTP 429'],['Decision','< 10ms']].map(([k,v])=>(
                <Box key={k} sx={{ display:'flex', justifyContent:'space-between', py:0.9, borderBottom:'1px solid #3f3f46' }}>
                  <Typography sx={{ color:'#71717a', fontSize:'0.8rem' }}>{k}</Typography>
                  <Typography sx={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.8rem', fontWeight:700, color:'#d4d4d8' }}>{v}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          {logs.length > 0 && (
            <Card>
              <CardContent sx={{ p:3 }}>
                <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
                  <Typography sx={{ fontWeight:700, color:'#e4e4e7', fontSize:'0.88rem' }}>📊 Session</Typography>
                  <Tooltip title="Clear logs">
                    <IconButton size="small" onClick={()=>{setLogs([]);requestNum.current=0}}
                      sx={{ color:'#52525b','&:hover':{color:'#ef4444'} }}>
                      <DeleteSweepIcon sx={{fontSize:16}}/>
                    </IconButton>
                  </Tooltip>
                </Box>
                <Grid container spacing={1.5}>
                  {[['Total',logs.length,'#fb923c','rgba(249,115,22,0.1)'],
                    ['Allowed',allowed,'#86efac','rgba(34,197,94,0.1)'],
                    ['Blocked',blocked,'#fca5a5','rgba(239,68,68,0.1)'],
                    ['Avg ms',`${Math.round(logs.reduce((a,b)=>a+b.latency,0)/logs.length)}`,'#fde047','rgba(234,179,8,0.1)']
                  ].map(([l,v,c,bg])=>(
                    <Grid item xs={6} key={l}>
                      <Box sx={{ p:1.5, bgcolor:bg, borderRadius:'8px', textAlign:'center', border:`1px solid ${c}22` }}>
                        <Typography sx={{ fontSize:'1.6rem', fontWeight:900, color:c, lineHeight:1 }}>{v}</Typography>
                        <Typography sx={{ fontSize:'0.67rem', color:'#71717a', mt:0.4 }}>{l}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ minHeight:500 }}>
            <CardContent sx={{ p:3 }}>
              <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:2 }}>
                <Box>
                  <Typography sx={{ fontWeight:700, color:'#e4e4e7', fontSize:'0.88rem' }}>📡 Live Request / Response Log</Typography>
                  <Typography sx={{ color:'#52525b', fontSize:'0.74rem', mt:0.3 }}>Every request shows the exact curl sent and raw JSON received</Typography>
                </Box>
                <Box sx={{ display:'flex', gap:1 }}>
                  <Chip label={`${allowed} allowed`} size="small" sx={{ bgcolor:'rgba(34,197,94,0.1)', color:'#86efac', border:'1px solid rgba(34,197,94,0.2)', fontWeight:700, fontSize:'0.7rem' }}/>
                  <Chip label={`${blocked} blocked`} size="small" sx={{ bgcolor:'rgba(239,68,68,0.1)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.2)', fontWeight:700, fontSize:'0.7rem' }}/>
                </Box>
              </Box>
              <Divider sx={{ borderColor:'#3f3f46', mb:2.5 }}/>
              {logs.length===0 ? (
                <Box sx={{ textAlign:'center', py:10 }}>
                  <Typography sx={{ fontSize:'3rem', mb:2 }}>🛡️</Typography>
                  <Typography sx={{ fontWeight:700, color:'#52525b', mb:0.8 }}>No requests yet</Typography>
                  <Typography sx={{ color:'#3f3f46', fontSize:'0.84rem', maxWidth:340, mx:'auto' }}>
                    Set your API key and hit Send — or run the 7-request demo to see the sliding window block requests 6 and 7.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight:680, overflowY:'auto', pr:0.5 }}>
                  <AnimatePresence>{logs.map(e=><RequestCard key={e.requestNum} entry={e}/>)}</AnimatePresence>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}