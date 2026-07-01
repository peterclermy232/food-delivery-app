package com.fooddelivery.controller;

import com.fooddelivery.dto.response.ApiResponse;
import com.fooddelivery.dto.response.UserResponse;
import com.fooddelivery.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> listUsers(
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.listUsers(role)));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.ok("User created", adminService.createUser(body)));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.updateUser(id, body)));
    }

    @PutMapping("/users/{id}/enable")
    public ResponseEntity<ApiResponse<UserResponse>> enableUser(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.setEnabled(id, true)));
    }

    @PutMapping("/users/{id}/disable")
    public ResponseEntity<ApiResponse<UserResponse>> disableUser(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.setEnabled(id, false)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getStats()));
    }
}
