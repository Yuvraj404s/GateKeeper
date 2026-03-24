# 🛡️ GateKeeper — Distributed API Rate Limiter Ecosystem

![Java](https://img.shields.io/badge/Java-21-orange) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green) ![Redis](https://img.shields.io/badge/Redis-7-red) ![Docker](https://img.shields.io/badge/Docker-Compose-blue)

> A production-grade, distributed API rate limiting system built with Java 21, Spring Boot 3, Spring Cloud, and Redis. Designed to handle high-throughput traffic with sub-10ms decision latency.

---

## 🏗️ Architecture

```
Client Request
      │
      ▼
┌─────────────────┐     discovers via     ┌──────────────────┐
│   API Gateway   │◄─────────────────────►│  Eureka Server   │
│  (Port: 8080)   │                        │   (Port: 8761)   │
└────────┬────────┘                        └──────────────────┘
         │ checks rate limit
         ▼
┌─────────────────────┐    logs event     ┌──────────────────────┐
│ Rate-Limiter-Service│──────────────────►│  Analytics-Service   │
│    (Port: 8081)     │                   │     (Port: 8082)     │
│  Redis Sliding      │                   │  PostgreSQL + @Async │
│  Window Algorithm   │                   └──────────────────────┘
└─────────────────────┘
         │ ALLOWED
         ▼
┌─────────────────────┐
│  Resource-Service   │
│    (Port: 8083)     │
│  GET /api/resource  │
└─────────────────────┘
```

## 🧠 How the Sliding Window Algorithm Works

1. On each request, the API Key + timestamp is recorded in a Redis **ZSET**
2. All entries older than **60 seconds** are removed (sliding window)
3. If remaining count **> 5**, request is **BLOCKED** (429)
4. If count **≤ 5**, request is **ALLOWED** and forwarded

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Java 21 (for local dev)

### Run Everything
```bash
git clone https://github.com/Yuvraj404s/GateKeeper.git
cd GateKeeper
docker-compose up --build
```

### Services
| Service | URL |
|---|---|
| Eureka Dashboard | http://localhost:8761 |
| API Gateway | http://localhost:8080 |
| Resource Endpoint | http://localhost:8080/api/resource/data |
| Analytics Dashboard | http://localhost:8082/analytics/blocked |

## 🧪 CURL Demo — See Rate Limiter in Action

Run this script to hit the gateway 7 times. Requests 1-5 succeed, 6-7 get blocked:

```bash
#!/bin/bash
API_KEY="test-user-123"
GATEWAY="http://localhost:8080/api/resource/data"

echo "🚀 Sending 7 requests with API Key: $API_KEY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for i in {1..7}; do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "X-API-KEY: $API_KEY" $GATEWAY)
  if [ "$RESPONSE" == "200" ]; then
    echo "Request $i → ✅ ALLOWED (200 OK)"
  elif [ "$RESPONSE" == "429" ]; then
    echo "Request $i → 🚫 BLOCKED (429 Too Many Requests)"
  else
    echo "Request $i → ⚠️  Status: $RESPONSE"
  fi
  sleep 0.2
done
```

## 📦 Project Structure

```
GateKeeper/
├── docker-compose.yml
├── eureka-server/
├── api-gateway/
├── rate-limiter-service/
├── analytics-service/
├── resource-service/
└── README.md
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3.2, Spring Cloud 2023 |
| Service Discovery | Netflix Eureka |
| Gateway | Spring Cloud Gateway |
| Rate Limiting | Redis 7 (Sorted Sets / ZSET) |
| Analytics DB | PostgreSQL 15 |
| Async Logging | Spring @Async |
| Containerization | Docker + Docker Compose |
| Testing | JUnit 5 + Mockito |

## 👨‍💻 Author
**Yuvraj Sonal** — [GitHub](https://github.com/Yuvraj404s)
