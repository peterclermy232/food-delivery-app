package com.fooddelivery.dto.response;

import com.fooddelivery.entity.Restaurant;
import lombok.*;
import java.util.List;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class RestaurantResponse {
    private String id;
    private String name;
    private String description;
    private String imageUrl;
    private String address;
    private Double rating;
    private Double deliveryFee;
    private Integer deliveryTimeMinutes;
    private Boolean isOpen;
    private List<String> categories;

    public static RestaurantResponse from(Restaurant r) {
        return RestaurantResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .description(r.getDescription())
                .imageUrl(r.getImageUrl())
                .address(r.getAddress())
                .rating(r.getRating())
                .deliveryFee(r.getDeliveryFee())
                .deliveryTimeMinutes(r.getDeliveryTimeMinutes())
                .isOpen(r.getIsOpen())
                .categories(r.getCategories() != null ? new java.util.ArrayList<>(r.getCategories()) : java.util.List.of())
                .build();
    }
}
