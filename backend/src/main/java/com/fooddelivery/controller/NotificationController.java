package com.fooddelivery.controller;
import com.fooddelivery.dto.response.ApiResponse;
import com.fooddelivery.entity.User;
import com.fooddelivery.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api/notifications") @RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getForUser(user)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable String id, @AuthenticationPrincipal User user) {
        notificationService.markRead(id, user);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
