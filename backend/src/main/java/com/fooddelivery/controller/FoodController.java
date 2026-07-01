package com.fooddelivery.controller;

import com.fooddelivery.dto.response.ApiResponse;
import com.fooddelivery.dto.response.FoodItemResponse;
import com.fooddelivery.service.FoodItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodItemService foodItemService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FoodItemResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(foodItemService.getById(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<FoodItemResponse>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.ok(foodItemService.search(q)));
    }
}
