package com.gatekeeper.analytics.service;

import com.gatekeeper.analytics.entity.AnalyticsEvent;
import com.gatekeeper.analytics.repository.AnalyticsEventRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AnalyticsService {

    private final AnalyticsEventRepository repository;

    public AnalyticsService(AnalyticsEventRepository repository) {
        this.repository = repository;
    }

    @Async
    public void saveEvent(String apiKey, String status, long responseTimeMs) {
        try {
            AnalyticsEvent event = new AnalyticsEvent(apiKey, status, responseTimeMs);
            repository.save(event);
        } catch (Exception e) {
            System.err.println("[Analytics] Failed to save event: " + e.getMessage());
        }
    }

    public Map<String, Object> getDashboard() {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long blocked = repository.countBlockedSince(oneHourAgo);
        long allowed = repository.countAllowedSince(oneHourAgo);
        long total = blocked + allowed;
        double blockRate = total > 0 ? (double) blocked / total * 100 : 0;

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("blockedLastHour", blocked);
        dashboard.put("allowedLastHour", allowed);
        dashboard.put("totalLastHour", total);
        dashboard.put("blockRatePercent", Math.round(blockRate * 100.0) / 100.0);
        dashboard.put("recentEvents", repository.findTop50ByOrderByTimestampDesc());
        return dashboard;
    }
}