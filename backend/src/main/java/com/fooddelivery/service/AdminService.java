package com.fooddelivery.service;

import com.fooddelivery.dto.response.UserResponse;
import com.fooddelivery.entity.User;
import com.fooddelivery.repository.OrderRepository;
import com.fooddelivery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers(String role) {
        if (role != null && !role.isBlank()) {
            User.Role r;
            try { r = User.Role.valueOf(role.toUpperCase()); }
            catch (IllegalArgumentException e) { throw new IllegalArgumentException("Unknown role: " + role); }
            return userRepository.findByRoleOrderByCreatedAtDesc(r)
                    .stream().map(UserResponse::from).toList();
        }
        return userRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(UserResponse::from).toList();
    }

    @Transactional
    public UserResponse createUser(Map<String, Object> body) {
        String name  = (String) body.get("name");
        String email = (String) body.get("email");
        String phone = (String) body.get("phone");
        String role  = (String) body.get("role");
        String pass  = (String) body.getOrDefault("password", "password123");

        if (name == null || email == null || role == null)
            throw new IllegalArgumentException("name, email, and role are required");

        if (userRepository.existsByEmail(email))
            throw new IllegalArgumentException("Email is already registered");

        User.Role userRole;
        try { userRole = User.Role.valueOf(role.toUpperCase()); }
        catch (IllegalArgumentException e) { throw new IllegalArgumentException("Unknown role: " + role); }

        if (userRole == User.Role.ADMIN || userRole == User.Role.CUSTOMER)
            throw new IllegalArgumentException("Admin can only onboard sellers and riders");

        User user = userRepository.save(User.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .password(passwordEncoder.encode(pass))
                .role(userRole)
                .build());

        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse setEnabled(String id, boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getRole() == User.Role.ADMIN)
            throw new IllegalArgumentException("Cannot disable an admin account");
        user.setEnabled(enabled);
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUser(String id, Map<String, Object> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (body.containsKey("name"))  user.setName((String) body.get("name"));
        if (body.containsKey("phone")) user.setPhone((String) body.get("phone"));
        if (body.containsKey("email")) {
            String newEmail = (String) body.get("email");
            if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail))
                throw new IllegalArgumentException("Email already in use");
            user.setEmail(newEmail);
        }
        if (body.containsKey("password")) {
            String p = (String) body.get("password");
            if (p != null && !p.isBlank()) user.setPassword(passwordEncoder.encode(p));
        }
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalSellers",   userRepository.countByRole(User.Role.SELLER));
        stats.put("totalRiders",    userRepository.countByRole(User.Role.RIDER));
        stats.put("totalCustomers", userRepository.countByRole(User.Role.CUSTOMER));
        stats.put("totalOrders",    orderRepository.count());
        return stats;
    }
}
