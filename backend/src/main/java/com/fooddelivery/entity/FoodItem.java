package com.fooddelivery.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "food_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    private Double price;
    private String imageUrl;
    private String category;
    private Double rating;
    private String mealTime;

    @Builder.Default
    private Boolean availableForDelivery = true;

    @Builder.Default
    private Boolean availableForPickup = true;

    @ElementCollection
    @CollectionTable(name = "food_sizes", joinColumns = @JoinColumn(name = "food_id"))
    @Column(name = "size")
    private List<String> sizes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;
}
