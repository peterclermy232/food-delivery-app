package com.fooddelivery.controller;

import com.fooddelivery.dto.response.ApiResponse;
import com.fooddelivery.dto.response.FoodItemResponse;
import com.fooddelivery.dto.response.OrderResponse;
import com.fooddelivery.dto.response.RestaurantResponse;
import com.fooddelivery.dto.response.SupportCaseResponse;
import com.fooddelivery.entity.User;
import com.fooddelivery.service.FoodItemService;
import com.fooddelivery.service.OrderService;
import com.fooddelivery.service.RestaurantService;
import com.fooddelivery.service.SupportCaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
public class SellerController {

    private final OrderService orderService;
    private final SupportCaseService supportCaseService;
    private final FoodItemService foodItemService;
    private final RestaurantService restaurantService;

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getSellerOrders(user)));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.updateStatus(id, body.get("status"), user)));
    }

    @GetMapping("/cases")
    public ResponseEntity<ApiResponse<List<SupportCaseResponse>>> getCases(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(supportCaseService.getSellerCases(user)));
    }

    @PutMapping("/cases/{id}/reply")
    public ResponseEntity<ApiResponse<SupportCaseResponse>> replyToCase(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(supportCaseService.replyToCase(id, body.get("message"), user)));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getSellerDashboard(user)));
    }

    @GetMapping("/foods")
    public ResponseEntity<ApiResponse<List<FoodItemResponse>>> getFoods(
            @RequestParam(required = false) String restaurantId,
            @AuthenticationPrincipal User user) {
        if (restaurantId != null && !restaurantId.isBlank()) {
            return ResponseEntity.ok(ApiResponse.ok(foodItemService.getBySellerRestaurant(user, restaurantId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(foodItemService.getBySellerRestaurants(user)));
    }

    @PostMapping("/foods")
    public ResponseEntity<ApiResponse<FoodItemResponse>> createFood(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(foodItemService.create(body, user)));
    }

    @PutMapping("/foods/{id}")
    public ResponseEntity<ApiResponse<FoodItemResponse>> updateFood(
            @PathVariable String id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(foodItemService.update(id, body, user)));
    }

    @DeleteMapping("/foods/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFood(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        foodItemService.delete(id, user);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/restaurants")
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> getRestaurants(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(restaurantService.getByOwner(user)));
    }

    @PostMapping("/restaurants")
    public ResponseEntity<ApiResponse<RestaurantResponse>> createRestaurant(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(restaurantService.create(body, user)));
    }

    @PutMapping("/restaurants/{id}")
    public ResponseEntity<ApiResponse<RestaurantResponse>> updateRestaurant(
            @PathVariable String id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(restaurantService.update(id, body, user)));
    }
}
