package com.gatekeeper.analytics.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analytics_events")
public class AnalyticsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String apiKey;

    @Column(nullable = false)
    private String status; // ALLOWED or BLOCKED

    @Column(nullable = false)
    private long responseTimeMs;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        this.timestamp = LocalDateTime.now();
    }

    public AnalyticsEvent() {}

    public AnalyticsEvent(String apiKey, String status, long responseTimeMs) {
        this.apiKey = apiKey;
        this.status = status;
        this.responseTimeMs = responseTimeMs;
    }

    public Long getId() { return id; }
    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public long getResponseTimeMs() { return responseTimeMs; }
    public void setResponseTimeMs(long responseTimeMs) { this.responseTimeMs = responseTimeMs; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}