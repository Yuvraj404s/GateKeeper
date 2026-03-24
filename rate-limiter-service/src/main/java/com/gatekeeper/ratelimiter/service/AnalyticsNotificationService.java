package com.gatekeeper.ratelimiter.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.HashMap;
import java.util.Map;

@Service
public class AnalyticsNotificationService {

    private final RestTemplate restTemplate;

    @Value("${analytics.service.url:http://localhost:8082}")
    private String analyticsServiceUrl;

    public AnalyticsNotificationService() {
        this.restTemplate = new RestTemplate();
    }

    @Async
    public void logEvent(String apiKey, String status, long responseTimeMs) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("apiKey", apiKey);
            event.put("status", status);
            event.put("responseTimeMs", responseTimeMs);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(event, headers);

            restTemplate.postForEntity(analyticsServiceUrl + "/analytics/log", request, String.class);
        } catch (Exception e) {
            // Swallow exceptions — analytics logging must never block the main flow
            System.err.println("[GateKeeper] Analytics log failed (non-critical): " + e.getMessage());
        }
    }
}