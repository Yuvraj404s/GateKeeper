package com.gatekeeper.ratelimiter.controller;

import com.gatekeeper.ratelimiter.model.RateLimitResponse;
import com.gatekeeper.ratelimiter.service.RateLimiterService;
import com.gatekeeper.ratelimiter.service.AnalyticsNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rate-limit")
public class RateLimiterController {

    private final RateLimiterService rateLimiterService;
    private final AnalyticsNotificationService analyticsNotificationService;

    public RateLimiterController(RateLimiterService rateLimiterService,
                                  AnalyticsNotificationService analyticsNotificationService) {
        this.rateLimiterService = rateLimiterService;
        this.analyticsNotificationService = analyticsNotificationService;
    }

    @PostMapping("/check")
    public ResponseEntity<RateLimitResponse> checkRateLimit(@RequestParam String apiKey) {
        RateLimitResponse response = rateLimiterService.checkRequest(apiKey);
        // Fire-and-forget async log to analytics service
        analyticsNotificationService.logEvent(apiKey, response.getStatus(), response.getResponseTimeMs());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Rate Limiter Service is UP");
    }
}