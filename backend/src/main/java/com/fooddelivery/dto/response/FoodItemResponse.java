package com.fooddelivery.dto.response;

import com.fooddelivery.entity.FoodItem;
import lombok.*;
import java.util.List;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class FoodItemResponse {
    private String id;
    private String name;
    private String description;
    private Double price;
    private String imageUrl;
    private String category;
    private Double rating;
    private String mealTime;
    private Boolean availableForDelivery;
    private Boolean availableForPickup;
    private List<String> sizes;
    private String restaurantId;
    private String restaurantName;

    public static FoodItemResponse from(FoodItem f) {
        return FoodItemResponse.builder()
                .id(f.getId())
                .name(f.getName())
                .description(f.getDescription())
                .price(f.getPrice())
                .imageUrl(f.getImageUrl())
                .category(f.getCategory())
                .rating(f.getRating())
                .mealTime(f.getMealTime())
                .availableForDelivery(f.getAvailableForDelivery())
                .availableForPickup(f.getAvailableForPickup())
                .sizes(f.getSizes() != null ? new java.util.ArrayList<>(f.getSizes()) : java.util.List.of())
                .restaurantId(f.getRestaurant().getId())
                .restaurantName(f.getRestaurant().getName())
                .build();
    }
}
