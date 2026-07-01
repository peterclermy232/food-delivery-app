package com.fooddelivery.controller;

import com.fooddelivery.dto.request.LoginRequest;
import com.fooddelivery.dto.request.RegisterRequest;
import com.fooddelivery.dto.response.ApiResponse;
import com.fooddelivery.dto.response.AuthResponse;
import com.fooddelivery.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody java.util.Map<String, String> body) {
        // In production, send an OTP/email. For now, just acknowledge.
        return ResponseEntity.ok(ApiResponse.ok("If the email exists, a code has been sent.", null));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@RequestBody java.util.Map<String, String> body) {
        // Stub — in production, verify against stored OTP
        return ResponseEntity.ok(ApiResponse.ok("OTP verified.", null));
    }
}
