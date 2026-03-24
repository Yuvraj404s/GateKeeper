package com.gatekeeper.gateway.filter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class RateLimiterFilter extends AbstractGatewayFilterFactory<RateLimiterFilter.Config> {

    private final WebClient webClient;

    @Value("${rate.limiter.service.url:http://localhost:8081}")
    private String rateLimiterUrl;

    public RateLimiterFilter(WebClient.Builder webClientBuilder) {
        super(Config.class);
        this.webClient = webClientBuilder.build();
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String apiKey = exchange.getRequest().getHeaders().getFirst("X-API-KEY");
            if (apiKey == null || apiKey.isBlank()) {
                apiKey = exchange.getRequest().getRemoteAddress() != null
                        ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                        : "unknown";
            }

            final String resolvedApiKey = apiKey;

            return webClient.post()
                    .uri(rateLimiterUrl + "/rate-limit/check?apiKey=" + resolvedApiKey)
                    .retrieve()
                    .bodyToMono(RateLimitResponse.class)
                    .flatMap(response -> {
                        if ("BLOCKED".equals(response.getStatus())) {
                            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
                            String body = "{\"error\": \"Too Many Requests\", \"message\": \"Rate limit exceeded. Max 5 requests per 60 seconds.\", \"apiKey\": \"" + resolvedApiKey + "\"}";
                            var dataBuffer = exchange.getResponse().bufferFactory().wrap(body.getBytes());
                            return exchange.getResponse().writeWith(Mono.just(dataBuffer));
                        }
                        return chain.filter(exchange);
                    })
                    .onErrorResume(ex -> {
                        // If rate limiter is down, fail open (allow request) with a warning header
                        exchange.getResponse().getHeaders().add("X-RateLimit-Warning", "Rate limiter unavailable");
                        return chain.filter(exchange);
                    });
        };
    }

    public static class Config {}

    // Inner DTO for deserializing rate limiter response
    static class RateLimitResponse {
        private String status;
        private long remainingRequests;
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getRemainingRequests() { return remainingRequests; }
        public void setRemainingRequests(long remainingRequests) { this.remainingRequests = remainingRequests; }
    }
}