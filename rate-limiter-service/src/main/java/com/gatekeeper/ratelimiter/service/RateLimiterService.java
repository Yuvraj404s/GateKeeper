package com.gatekeeper.ratelimiter.service;

import com.gatekeeper.ratelimiter.model.RateLimitResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.TimeUnit;

@Service
public class RateLimiterService {

    private final StringRedisTemplate redisTemplate;

    @Value("${rate.limiter.max-requests:5}")
    private int maxRequests;

    @Value("${rate.limiter.window-seconds:60}")
    private long windowSeconds;

    public RateLimiterService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Sliding Window Log Algorithm using Redis ZSET
     * Thread-safe, optimized for sub-10ms latency
     */
    public synchronized RateLimitResponse checkRequest(String apiKey) {
        long startTime = System.currentTimeMillis();

        String redisKey = "rate_limit:" + apiKey;
        long nowMillis = Instant.now().toEpochMilli();
        long windowStartMillis = nowMillis - (windowSeconds * 1000);

        ZSetOperations<String, String> zSetOps = redisTemplate.opsForZSet();

        // Remove timestamps older than the sliding window
        zSetOps.removeRangeByScore(redisKey, 0, windowStartMillis);

        // Count remaining entries in the current window
        Long currentCount = zSetOps.zCard(redisKey);
        long count = (currentCount != null) ? currentCount : 0;

        String status;
        if (count >= maxRequests) {
            status = "BLOCKED";
        } else {
            // Add current timestamp as member (unique by appending millis+nano)
            String member = nowMillis + "-" + System.nanoTime();
            zSetOps.add(redisKey, member, nowMillis);
            redisTemplate.expire(redisKey, windowSeconds + 10, TimeUnit.SECONDS);
            count = count + 1;
            status = "ALLOWED";
        }

        long responseTime = System.currentTimeMillis() - startTime;
        long remaining = Math.max(0, maxRequests - count);

        return new RateLimitResponse(apiKey, status, count, remaining, windowSeconds, responseTime);
    }
}