package com.fooddelivery.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class PlaceOrderRequest {
    @NotEmpty
    private List<OrderItemRequest> items;

    @NotBlank
    private String restaurantId;

    @NotBlank
    private String deliveryAddress;

    private String paymentMethod;

    @Data
    public static class OrderItemRequest {
        private String foodItemId;
        private Integer quantity;
        private String size;
    }
}
