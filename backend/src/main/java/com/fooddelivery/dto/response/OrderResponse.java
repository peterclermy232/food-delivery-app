package com.fooddelivery.dto.response;

import com.fooddelivery.entity.Order;
import com.fooddelivery.entity.OrderItem;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class OrderResponse {
    private String id;
    private String orderNumber;
    private String restaurantId;
    private String restaurantName;
    private String status;
    private Double totalAmount;
    private String deliveryAddress;
    private String paymentMethod;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
    private String customerId;
    private String customerName;
    private String customerPhone;
    private String riderId;
    private String riderName;
    private String riderPhone;
    private Integer ratingValue;
    private String ratingComment;
    private Double distanceKm;
    private Double restaurantLatitude;
    private Double restaurantLongitude;
    private Double riderLatitude;
    private Double riderLongitude;

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class OrderItemResponse {
        private String foodItemId;
        private String foodItemName;
        private Integer quantity;
        private String size;
        private Double unitPrice;
        private Double subtotal;
    }

    public static OrderResponse from(Order o) {
        List<OrderItemResponse> itemResponses = o.getItems() == null ? List.of() :
                o.getItems().stream().map(i -> OrderItemResponse.builder()
                        .foodItemId(i.getFoodItem().getId())
                        .foodItemName(i.getFoodItem().getName())
                        .quantity(i.getQuantity())
                        .size(i.getSize())
                        .unitPrice(i.getUnitPrice())
                        .subtotal(i.getSubtotal())
                        .build()
                ).toList();

        return OrderResponse.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .restaurantId(o.getRestaurant().getId())
                .restaurantName(o.getRestaurant().getName())
                .status(o.getStatus().name().toLowerCase())
                .totalAmount(o.getTotalAmount())
                .deliveryAddress(o.getDeliveryAddress())
                .paymentMethod(o.getPaymentMethod())
                .items(itemResponses)
                .createdAt(o.getCreatedAt())
                .customerId(o.getCustomer() != null ? o.getCustomer().getId() : null)
                .customerName(o.getCustomer() != null ? o.getCustomer().getName() : null)
                .customerPhone(o.getCustomer() != null ? o.getCustomer().getPhone() : null)
                .riderId(o.getRider() != null ? o.getRider().getId() : null)
                .riderName(o.getRider() != null ? o.getRider().getName() : null)
                .riderPhone(o.getRider() != null ? o.getRider().getPhone() : null)
                .ratingValue(o.getRatingValue())
                .ratingComment(o.getRatingComment())
                .restaurantLatitude(o.getRestaurant().getLatitude())
                .restaurantLongitude(o.getRestaurant().getLongitude())
                .riderLatitude(o.getRider() != null ? o.getRider().getLatitude() : null)
                .riderLongitude(o.getRider() != null ? o.getRider().getLongitude() : null)
                .build();
    }
}
