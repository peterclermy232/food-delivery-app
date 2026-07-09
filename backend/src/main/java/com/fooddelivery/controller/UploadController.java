package com.fooddelivery.controller;

import com.fooddelivery.dto.response.ApiResponse;
import com.fooddelivery.entity.User;
import com.fooddelivery.service.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final SupabaseStorageService storageService;

    @PostMapping(value = "/image", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        if (file.isEmpty()) throw new IllegalArgumentException("No file provided");
        String url = storageService.upload(file, "uploads/" + user.getId());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("url", url)));
    }
}
