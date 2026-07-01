package com.fooddelivery.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "restaurants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    private String imageUrl;
    private String address;
    private Double latitude;
    private Double longitude;
    private Double rating;
    private Double deliveryFee;
    private Integer deliveryTimeMinutes;

    @Builder.Default
    private Boolean isOpen = true;

    @ElementCollection
    @CollectionTable(name = "restaurant_categories", joinColumns = @JoinColumn(name = "restaurant_id"))
    @Column(name = "category")
    private List<String> categories;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
