package com.fooddelivery.controller;

import com.fooddelivery.dto.response.ApiResponse;
import com.fooddelivery.dto.response.FoodItemResponse;
import com.fooddelivery.dto.response.RestaurantResponse;
import com.fooddelivery.service.FoodItemService;
import com.fooddelivery.service.OrderService;
import com.fooddelivery.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final FoodItemService foodItemService;
    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> getAll(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.ok(restaurantService.getAll(category, search)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RestaurantResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(restaurantService.getById(id)));
    }

    @GetMapping("/{id}/foods")
    public ResponseEntity<ApiResponse<List<FoodItemResponse>>> getFoods(
            @PathVariable String id,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(ApiResponse.ok(foodItemService.getByRestaurant(id, category)));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getReviews(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getReviewsForRestaurant(id)));
    }
}
