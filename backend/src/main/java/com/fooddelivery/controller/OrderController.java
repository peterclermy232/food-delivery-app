package com.fooddelivery.controller;

import com.fooddelivery.dto.request.PlaceOrderRequest;
import com.fooddelivery.dto.request.RateOrderRequest;
import com.fooddelivery.dto.response.ApiResponse;
import com.fooddelivery.dto.response.OrderResponse;
import com.fooddelivery.entity.User;
import com.fooddelivery.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @Valid @RequestBody PlaceOrderRequest request,
            @AuthenticationPrincipal User user) {
        OrderResponse response = orderService.placeOrder(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Order placed successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getMyOrders(user)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getById(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getById(id, user)));
    }

    @GetMapping("/{id}/track")
    public ResponseEntity<ApiResponse<OrderResponse>> trackOrder(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getById(id, user)));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("Order cancelled", orderService.cancelOrder(id, user)));
    }

    @PutMapping("/{id}/rate")
    public ResponseEntity<ApiResponse<OrderResponse>> rateOrder(
            @PathVariable String id,
            @RequestBody RateOrderRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.rateOrder(id, request.getRating(), request.getComment(), user)));
    }
}
