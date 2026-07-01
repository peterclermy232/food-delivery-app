package com.fooddelivery.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "support_cases")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SupportCase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(nullable = false)
    private String subject;

    @Column(length = 1000)
    private String description;

    @Column(length = 1000)
    private String replyMessage;

    @Column
    private java.time.LocalDateTime repliedAt;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CaseStatus status = CaseStatus.OPEN;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum CaseStatus { OPEN, IN_REVIEW, RESOLVED, CLOSED }
}
