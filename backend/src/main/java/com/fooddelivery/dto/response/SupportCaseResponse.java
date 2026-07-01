package com.fooddelivery.dto.response;

import com.fooddelivery.entity.SupportCase;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class SupportCaseResponse {
    private String id;
    private String orderId;
    private String orderNumber;
    private String subject;
    private String description;
    private String status;
    private LocalDateTime createdAt;
    private String replyMessage;
    private java.time.LocalDateTime repliedAt;

    public static SupportCaseResponse from(SupportCase sc) {
        return SupportCaseResponse.builder()
                .id(sc.getId())
                .orderId(sc.getOrder().getId())
                .orderNumber(sc.getOrder().getOrderNumber())
                .subject(sc.getSubject())
                .description(sc.getDescription())
                .status(sc.getStatus().name().toLowerCase())
                .createdAt(sc.getCreatedAt())
                .replyMessage(sc.getReplyMessage())
                .repliedAt(sc.getRepliedAt())
                .build();
    }
}
