package com.gatekeeper.analytics.repository;

import com.gatekeeper.analytics.entity.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {

    @Query("SELECT COUNT(e) FROM AnalyticsEvent e WHERE e.status = 'BLOCKED' AND e.timestamp >= :since")
    long countBlockedSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(e) FROM AnalyticsEvent e WHERE e.status = 'ALLOWED' AND e.timestamp >= :since")
    long countAllowedSince(@Param("since") LocalDateTime since);

    List<AnalyticsEvent> findTop50ByOrderByTimestampDesc();
}