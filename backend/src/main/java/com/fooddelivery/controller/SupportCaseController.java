package com.fooddelivery.controller;

import com.fooddelivery.dto.response.ApiResponse;
import com.fooddelivery.dto.response.SupportCaseResponse;
import com.fooddelivery.entity.User;
import com.fooddelivery.service.SupportCaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
public class SupportCaseController {

    private final SupportCaseService supportCaseService;

    @PostMapping
    public ResponseEntity<ApiResponse<SupportCaseResponse>> raiseCase(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(
                supportCaseService.raiseCase(body.get("orderId"), body.get("subject"), body.get("description"), user)
        ));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<List<SupportCaseResponse>>> getOrderCases(@PathVariable String orderId) {
        return ResponseEntity.ok(ApiResponse.ok(supportCaseService.getCasesForOrder(orderId)));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<SupportCaseResponse>>> getMyCases(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(supportCaseService.getMyCases(user)));
    }
}
