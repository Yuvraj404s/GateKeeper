#!/bin/bash
# GateKeeper Rate Limiter Demo
# Fires 7 requests — first 5 ALLOWED, last 2 BLOCKED

API_KEY="demo-user-$(date +%s)"
GATEWAY="http://localhost:8080/api/resource/data"

echo ""
echo "🛡️  GateKeeper — Rate Limiter Demo"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   API Key : $API_KEY"
echo "   Limit   : 5 requests per 60 seconds"
echo "   Gateway : $GATEWAY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for i in {1..7}; do
  HTTP_CODE=$(curl -s -o /tmp/gk_response.json -w "%{http_code}" \
    -H "X-API-KEY: $API_KEY" \
    -H "Content-Type: application/json" \
    "$GATEWAY")

  if [ "$HTTP_CODE" == "200" ]; then
    echo "  Request $i  →  ✅  ALLOWED  (HTTP 200)"
  elif [ "$HTTP_CODE" == "429" ]; then
    echo "  Request $i  →  🚫  BLOCKED  (HTTP 429 Too Many Requests)"
  else
    echo "  Request $i  →  ⚠️   Status: $HTTP_CODE"
    cat /tmp/gk_response.json
  fi
  sleep 0.3
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊  Check Analytics Dashboard:"
echo "    curl http://localhost:8082/analytics/blocked"
echo ""
echo "🔭  Check Eureka Service Registry:"
echo "    http://localhost:8761"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
