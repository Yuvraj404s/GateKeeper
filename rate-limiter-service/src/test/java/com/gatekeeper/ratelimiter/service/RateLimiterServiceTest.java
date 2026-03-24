package com.gatekeeper.ratelimiter.service;

import com.gatekeeper.ratelimiter.model.RateLimitResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Sliding Window Rate Limiter Tests")
class RateLimiterServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ZSetOperations<String, String> zSetOps;

    @InjectMocks
    private RateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(rateLimiterService, "maxRequests", 5);
        ReflectionTestUtils.setField(rateLimiterService, "windowSeconds", 60L);
        when(redisTemplate.opsForZSet()).thenReturn(zSetOps);
        doNothing().when(zSetOps).removeRangeByScore(anyString(), anyDouble(), anyDouble());
    }

    @Test
    @DisplayName("Should ALLOW first 5 requests within 60 seconds")
    void shouldAllowFirst5Requests() {
        String apiKey = "test-user-allow";
        // Simulate 0 existing requests in window
        when(zSetOps.zCard(anyString())).thenReturn(0L);
        when(zSetOps.add(anyString(), anyString(), anyDouble())).thenReturn(true);
        when(redisTemplate.expire(anyString(), anyLong(), any())).thenReturn(true);

        for (int i = 1; i <= 5; i++) {
            RateLimitResponse response = rateLimiterService.checkRequest(apiKey);
            assertEquals("ALLOWED", response.getStatus(),
                "Request " + i + " should be ALLOWED");
        }
    }

    @Test
    @DisplayName("Should BLOCK the 6th request within 60 seconds")
    void shouldBlockSixthRequest() {
        String apiKey = "test-user-block";
        // Simulate 5 existing requests already in the window
        when(zSetOps.zCard(anyString())).thenReturn(5L);

        RateLimitResponse response = rateLimiterService.checkRequest(apiKey);

        assertEquals("BLOCKED", response.getStatus(), "6th request should be BLOCKED");
        assertEquals(0L, response.getRemainingRequests(), "Remaining requests should be 0");
    }

    @Test
    @DisplayName("Should return response time under 10ms")
    void shouldRespondUnder10ms() {
        when(zSetOps.zCard(anyString())).thenReturn(0L);
        when(zSetOps.add(anyString(), anyString(), anyDouble())).thenReturn(true);
        when(redisTemplate.expire(anyString(), anyLong(), any())).thenReturn(true);

        RateLimitResponse response = rateLimiterService.checkRequest("perf-test-key");

        assertTrue(response.getResponseTimeMs() < 10,
            "Response time should be under 10ms, was: " + response.getResponseTimeMs() + "ms");
    }

    @Test
    @DisplayName("Should include correct API key in response")
    void shouldReturnCorrectApiKey() {
        String apiKey = "my-special-api-key";
        when(zSetOps.zCard(anyString())).thenReturn(2L);
        when(zSetOps.add(anyString(), anyString(), anyDouble())).thenReturn(true);
        when(redisTemplate.expire(anyString(), anyLong(), any())).thenReturn(true);

        RateLimitResponse response = rateLimiterService.checkRequest(apiKey);

        assertEquals(apiKey, response.getApiKey());
        assertEquals(60L, response.getWindowSeconds());
    }

    @Test
    @DisplayName("Should correctly calculate remaining requests")
    void shouldCalculateRemainingRequests() {
        when(zSetOps.zCard(anyString())).thenReturn(3L);
        when(zSetOps.add(anyString(), anyString(), anyDouble())).thenReturn(true);
        when(redisTemplate.expire(anyString(), anyLong(), any())).thenReturn(true);

        RateLimitResponse response = rateLimiterService.checkRequest("count-test");

        assertEquals("ALLOWED", response.getStatus());
        assertEquals(1L, response.getRemainingRequests(), "After 4th request, 1 should remain");
    }
}