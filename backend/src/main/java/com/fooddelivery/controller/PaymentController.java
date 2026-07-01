package com.fooddelivery.controller;
import com.fooddelivery.dto.request.AddCardRequest;
import com.fooddelivery.dto.response.ApiResponse;
import com.fooddelivery.entity.PaymentCard;
import com.fooddelivery.entity.User;
import com.fooddelivery.repository.PaymentCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api/payment") @RequiredArgsConstructor
public class PaymentController {
    private final PaymentCardRepository paymentCardRepository;

    @GetMapping("/cards")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCards(@AuthenticationPrincipal User user) {
        var cards = paymentCardRepository.findByUser(user).stream()
            .map(c -> Map.<String, Object>of(
                "id", c.getId(),
                "holderName", c.getHolderName(),
                "lastFour", c.getLastFour(),
                "brand", c.getBrand(),
                "expiryDate", c.getExpiryDate()
            )).toList();
        return ResponseEntity.ok(ApiResponse.ok(cards));
    }

    @PostMapping("/cards")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addCard(
            @RequestBody AddCardRequest req,
            @AuthenticationPrincipal User user) {
        String lastFour = req.getCardNumber() != null && req.getCardNumber().length() >= 4
            ? req.getCardNumber().replaceAll("\\s", "").substring(req.getCardNumber().replaceAll("\\s","").length() - 4)
            : "0000";
        String brand = req.getCardNumber() != null && req.getCardNumber().replaceAll("\\s","").startsWith("4")
            ? "visa" : "mastercard";
        PaymentCard card = paymentCardRepository.save(PaymentCard.builder()
            .user(user).holderName(req.getHolderName())
            .lastFour(lastFour).brand(brand).expiryDate(req.getExpiryDate()).build());
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
            "id", card.getId(), "holderName", card.getHolderName(),
            "lastFour", card.getLastFour(), "brand", card.getBrand(),
            "expiryDate", card.getExpiryDate())));
    }

    @DeleteMapping("/cards/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCard(@PathVariable String id, @AuthenticationPrincipal User user) {
        paymentCardRepository.findById(id).ifPresent(c -> {
            if (c.getUser().getId().equals(user.getId())) paymentCardRepository.delete(c);
        });
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
