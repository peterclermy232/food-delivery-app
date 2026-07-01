package com.fooddelivery.controller;

import com.fooddelivery.dto.response.ApiResponse;
import com.fooddelivery.dto.response.OrderResponse;
import com.fooddelivery.entity.User;
import com.fooddelivery.repository.UserRepository;
import com.fooddelivery.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rider")
@RequiredArgsConstructor
public class RiderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getRiderOrders(user)));
    }

    @PutMapping("/orders/{id}/pickup")
    public ResponseEntity<ApiResponse<OrderResponse>> pickup(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.riderPickup(id, user)));
    }

    @PutMapping("/orders/{id}/deliver")
    public ResponseEntity<ApiResponse<OrderResponse>> deliver(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.riderDeliver(id, user)));
    }

    @PutMapping("/location")
    public ResponseEntity<ApiResponse<Void>> updateLocation(
            @RequestBody Map<String, Double> body,
            @AuthenticationPrincipal User user) {
        user.setLatitude(body.get("latitude"));
        user.setLongitude(body.get("longitude"));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
