package com.fooddelivery.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "payment_cards")
@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class PaymentCard {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String holderName;

    @Column(nullable = false, length = 4)
    private String lastFour;

    @Column(nullable = false)
    private String brand; // visa, mastercard

    @Column(nullable = false)
    private String expiryDate; // MM/YY
}
