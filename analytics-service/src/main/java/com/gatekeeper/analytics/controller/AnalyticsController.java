package com.gatekeeper.analytics.controller;

import com.gatekeeper.analytics.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @PostMapping("/log")
    public ResponseEntity<String> logEvent(@RequestBody Map<String, Object> event) {
        String apiKey = (String) event.getOrDefault("apiKey", "unknown");
        String status = (String) event.getOrDefault("status", "UNKNOWN");
        long responseTime = Long.parseLong(event.getOrDefault("responseTimeMs", 0).toString());
        analyticsService.saveEvent(apiKey, status, responseTime);
        return ResponseEntity.accepted().body("Event logged");
    }

    @GetMapping("/blocked")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(analyticsService.getDashboard());
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Analytics Service is UP");
    }
}