package com.fooddelivery.controller;

import com.fooddelivery.dto.response.ApiResponse;
import com.fooddelivery.repository.FoodItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final FoodItemRepository foodItemRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<String>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(foodItemRepository.findDistinctCategories()));
    }
}
