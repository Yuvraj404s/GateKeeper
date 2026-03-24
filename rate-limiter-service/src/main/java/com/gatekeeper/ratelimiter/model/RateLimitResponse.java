package com.gatekeeper.ratelimiter.model;

public class RateLimitResponse {
    private String apiKey;
    private String status;
    private long requestCount;
    private long remainingRequests;
    private long windowSeconds;
    private long responseTimeMs;

    public RateLimitResponse() {}

    public RateLimitResponse(String apiKey, String status, long requestCount, long remainingRequests, long windowSeconds, long responseTimeMs) {
        this.apiKey = apiKey;
        this.status = status;
        this.requestCount = requestCount;
        this.remainingRequests = remainingRequests;
        this.windowSeconds = windowSeconds;
        this.responseTimeMs = responseTimeMs;
    }

    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public long getRequestCount() { return requestCount; }
    public void setRequestCount(long requestCount) { this.requestCount = requestCount; }
    public long getRemainingRequests() { return remainingRequests; }
    public void setRemainingRequests(long remainingRequests) { this.remainingRequests = remainingRequests; }
    public long getWindowSeconds() { return windowSeconds; }
    public void setWindowSeconds(long windowSeconds) { this.windowSeconds = windowSeconds; }
    public long getResponseTimeMs() { return responseTimeMs; }
    public void setResponseTimeMs(long responseTimeMs) { this.responseTimeMs = responseTimeMs; }
}