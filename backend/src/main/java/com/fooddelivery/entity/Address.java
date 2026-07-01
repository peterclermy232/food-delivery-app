package com.fooddelivery.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AddressLabel label = AddressLabel.HOME;

    @Column(nullable = false)
    private String fullAddress;

    private String street;
    private String postCode;
    private String apartment;
    private Double latitude;
    private Double longitude;

    public enum AddressLabel { HOME, WORK, OTHER }
}
