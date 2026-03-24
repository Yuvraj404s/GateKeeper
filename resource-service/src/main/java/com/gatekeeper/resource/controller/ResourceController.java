package com.gatekeeper.resource.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/resource")
public class ResourceController {

    @GetMapping("/data")
    public ResponseEntity<Map<String, Object>> getData(
            @RequestHeader(value = "X-API-KEY", defaultValue = "anonymous") String apiKey) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "✅ Success! Request allowed by GateKeeper.");
        response.put("service", "GateKeeper Resource Service");
        response.put("apiKey", apiKey);
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("data", Map.of(
            "resourceId", "res-" + System.currentTimeMillis(),
            "content", "Protected resource data — you passed the rate limiter!"
        ));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Resource Service is UP");
    }
}