package com.fooddelivery.dto.response;

import com.fooddelivery.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String bio;
    private String avatarUrl;
    private String role;
    private Double balance;
    private Boolean enabled;
    private String createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name().toLowerCase())
                .balance(user.getBalance())
                .enabled(user.getEnabled())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }
}
