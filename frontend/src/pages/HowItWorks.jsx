import React from 'react'
import {
  Box, Container, Grid, Card, CardContent,
  Typography, Chip, Divider, Stepper, Step, StepLabel, StepContent
} from '@mui/material'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { motion } from 'framer-motion'

const CodeBlock = ({ code, language = 'bash', title }) => (
  <Box sx={{ mb: 2 }}>
    {title && <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 700, display: 'block', mb: 0.5 }}>{title}</Typography>}
    <SyntaxHighlighter language={language} style={vscDarkPlus}
      customStyle={{ borderRadius: 8, fontSize: '0.8rem', margin: 0 }}>
      {code}
    </SyntaxHighlighter>
  </Box>
)

export default function HowItWorks() {
  const steps = [
    {
      label: 'Client sends request to API Gateway (port 8090)',
      description: 'Any HTTP client — browser, curl, your app — sends a request with an X-API-KEY header to the Gateway.',
      code: `curl -X GET http://localhost:8090/api/resource/data \
  -H "X-API-KEY: my-service-key"`,
      lang: 'bash'
    },
    {
      label: 'Gateway calls Rate Limiter Service (non-blocking WebClient)',
      description: 'Before forwarding, the Gateway Filter makes a non-blocking async call to the Rate Limiter via WebClient. This is reactive — it never blocks a thread.',
      code: `// RateLimiterFilter.java (inside API Gateway)
webClient.post()
  .uri(rateLimiterUrl + "/rate-limit/check?apiKey=" + apiKey)
  .retrieve()
  .bodyToMono(RateLimitResponse.class)
  .flatMap(response -> {
    if ("BLOCKED".equals(response.getStatus())) {
      exchange.getResponse().setStatusCode(TOO_MANY_REQUESTS);
      // return 429 immediately
    }
    return chain.filter(exchange); // forward if ALLOWED
  })`,
      lang: 'java'
    },
    {
      label: 'Sliding Window Log checks Redis ZSET',
      description: 'The Rate Limiter uses Redis Sorted Sets. Each member is a timestamp. Old entries are pruned, count is checked against the limit.',
      code: `// RateLimiterService.java
String redisKey = "rate_limit:" + apiKey;
long nowMillis = Instant.now().toEpochMilli();
long windowStart = nowMillis - (60 * 1000); // 60s window

// Step 1: Remove timestamps older than window
zSetOps.removeRangeByScore(redisKey, 0, windowStart);

// Step 2: Count remaining
Long count = zSetOps.zCard(redisKey); // O(1)

// Step 3: Decision
if (count >= 5) return "BLOCKED";   // 429

zSetOps.add(redisKey, timestamp, score); // record this request
return "ALLOWED";                         // 200`,
      lang: 'java'
    },
    {
      label: 'Decision fires async analytics event',
      description: 'Regardless of ALLOWED/BLOCKED, the decision is logged to Analytics Service via Spring @Async — completely off the critical path, zero latency impact.',
      code: `@Async  // runs in a separate thread pool — user is NOT waiting for this
public void logEvent(String apiKey, String status, long responseTimeMs) {
  restTemplate.postForEntity(
    analyticsServiceUrl + "/analytics/log",
    Map.of("apiKey", apiKey, "status", status, "responseTimeMs", responseTimeMs),
    String.class
  );
}`,
      lang: 'java'
    },
    {
      label: 'Request forwarded (or blocked) — response returned',
      description: 'ALLOWED requests are load-balanced to the Resource Service via Eureka service discovery. Blocked requests get HTTP 429 immediately from the Gateway.',
      code: `// ALLOWED → Gateway routes to Resource Service via Eureka lb://
// Response:
{
  "message": "✅ Success! Request allowed by GateKeeper.",
  "service": "GateKeeper Resource Service",
  "apiKey": "my-service-key",
  "data": { "resourceId": "res-1234", "content": "Protected data" }
}

// BLOCKED → Gateway returns immediately:
// HTTP 429 Too Many Requests
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Max 5 requests per 60 seconds."
}`,
      lang: 'json'
    }
  ]

  const integrationSnippets = [
    {
      title: '🐍 Python Integration',
      lang: 'python',
      code: `import requests

GATEWAY_URL = "http://your-gatekeeper-host:8090"
API_KEY = "my-python-service"

def call_protected_resource():
    response = requests.get(
        f"{GATEWAY_URL}/api/resource/data",
        headers={"X-API-KEY": API_KEY}
    )
    if response.status_code == 429:
        print("Rate limited! Try again later.")
        return None
    return response.json()`
    },
    {
      title: '☕ Java Integration',
      lang: 'java',
      code: `RestTemplate restTemplate = new RestTemplate();
HttpHeaders headers = new HttpHeaders();
headers.set("X-API-KEY", "my-java-service");

try {
    ResponseEntity<String> response = restTemplate.exchange(
        "http://gatekeeper-host:8090/api/resource/data",
        HttpMethod.GET,
        new HttpEntity<>(headers),
        String.class
    );
    // process response
} catch (HttpClientErrorException.TooManyRequests e) {
    // handle 429 - rate limited
}`
    },
    {
      title: '🟨 JavaScript / Node.js Integration',
      lang: 'javascript',
      code: `const axios = require('axios');

const gatekeeperClient = axios.create({
  baseURL: 'http://gatekeeper-host:8090',
  headers: { 'X-API-KEY': 'my-node-service' }
});

// Add interceptor to handle rate limiting
gatekeeperClient.interceptors.response.use(null, error => {
  if (error.response?.status === 429) {
    console.log('Rate limited - implement retry with backoff');
  }
  return Promise.reject(error);
});

const data = await gatekeeperClient.get('/api/resource/data');`
    }
  ]

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>📖 How GateKeeper Works</Typography>
        <Typography variant="body1" sx={{ color: '#9ca3af' }}>
          A transparent walkthrough of every hop a request makes through the system — from client to resource and back.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Architecture */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: '#111827', mb: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>🏗️ System Architecture</Typography>
              <Box sx={{ p: 2, bgcolor: '#0d1117', borderRadius: 2, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#a5b4fc', overflowX: 'auto' }}>
                <pre>{`
  Your App / Browser / curl
           │
           ▼  X-API-KEY header
  ┌─────────────────────┐        ┌─────────────────────┐
  │    API Gateway      │◄──────►│   Eureka Server     │
  │    port: 8090       │ disco  │    port: 8761        │
  └────────┬────────────┘        └─────────────────────┘
           │ WebClient (non-blocking)
           ▼
  ┌─────────────────────┐   @Async   ┌──────────────────────┐
  │  Rate Limiter Svc   │──────────►│   Analytics Service  │
  │    port: 8091       │            │     port: 8092       │
  │  Redis ZSET         │            │  PostgreSQL + JPA    │
  │  Sliding Window     │            └──────────────────────┘
  └────────┬────────────┘
           │ ALLOWED only
           ▼
  ┌─────────────────────┐
  │   Resource Service  │
  │    port: 8093       │
  │  Protected endpoint │
  └─────────────────────┘
`}</pre>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Step by Step */}
        <Grid item xs={12} md={7}>
          <Card sx={{ bgcolor: '#111827' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>🔄 Request Lifecycle — Step by Step</Typography>
              <Stepper orientation="vertical" sx={{ '& .MuiStepConnector-line': { borderColor: '#1f2937' } }}>
                {steps.map((step, i) => (
                  <Step key={i} active={true} sx={{ '& .MuiStepLabel-iconContainer .MuiStepIcon-root': { color: '#6366f1' } }}>
                    <StepLabel>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#e5e7eb' }}>{step.label}</Typography>
                    </StepLabel>
                    <StepContent sx={{ borderLeft: '1px solid #1f2937', ml: 1 }}>
                      <Typography variant="body2" sx={{ color: '#9ca3af', mb: 1.5 }}>{step.description}</Typography>
                      <CodeBlock code={step.code} language={step.lang} />
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        {/* Integration Guide */}
        <Grid item xs={12} md={5}>
          <Card sx={{ bgcolor: '#111827', mb: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>🔌 Integrate Into Your Own App</Typography>
              <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>
                GateKeeper acts as a drop-in API Gateway. Point your service at the Gateway URL and add the X-API-KEY header — that's it.
              </Typography>
              {integrationSnippets.map(s => (
                <Box key={s.title} sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#e5e7eb' }}>{s.title}</Typography>
                  <CodeBlock code={s.code} language={s.lang} />
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: '#111827' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>⚙️ Tech Stack Deep Dive</Typography>
              {[
                { tech: 'Spring Cloud Gateway', detail: 'Reactive gateway using Project Reactor / Netty', color: '#6366f1' },
                { tech: 'Netflix Eureka', detail: 'Service registry for dynamic discovery', color: '#8b5cf6' },
                { tech: 'Redis ZSET', detail: 'O(log N) sorted set for sliding window timestamps', color: '#ef4444' },
                { tech: 'WebClient', detail: 'Non-blocking HTTP client — no thread blocking', color: '#10b981' },
                { tech: 'Spring @Async', detail: 'Thread pool executor for fire-and-forget logging', color: '#f59e0b' },
                { tech: 'PostgreSQL + JPA', detail: 'Persistent analytics event store', color: '#3b82f6' },
                { tech: 'Docker Compose', detail: '6-container orchestration on shared network', color: '#06b6d4' },
              ].map(item => (
                <Box key={item.tech} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'flex-start' }}>
                  <Chip label={item.tech} size="small"
                    sx={{ bgcolor: `${item.color}18`, color: item.color, border: `1px solid ${item.color}33`, fontWeight: 700, fontSize: '0.72rem', minWidth: 160 }} />
                  <Typography variant="caption" sx={{ color: '#9ca3af', pt: 0.3 }}>{item.detail}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}