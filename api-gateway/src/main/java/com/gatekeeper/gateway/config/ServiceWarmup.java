package com.gatekeeper.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class ServiceWarmup {

    @Value("${RESOURCE_SERVICE_URL:http://localhost:8083}")
    private String resourceUrl;

    @Value("${RATE_LIMITER_URL:http://localhost:8081}")
    private String rateLimiterUrl;

    private final WebClient webClient;

    public ServiceWarmup(WebClient.Builder builder) {
        this.webClient = builder.build();
    }

    @EventListener(ApplicationReadyEvent.class)
    public void warmup() {
        ping(resourceUrl + "/api/resource/health");
        ping(rateLimiterUrl + "/actuator/health");
    }

    private void ping(String url) {
        webClient.get().uri(url)
            .retrieve().bodyToMono(String.class)
            .subscribe(
                r -> System.out.println("[Warmup] ✅ " + url),
                e -> System.out.println("[Warmup] ⚠️ " + url + " - " + e.getMessage())
            );
    }
}