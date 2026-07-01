package com.fooddelivery.repository;

import com.fooddelivery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    List<User> findByRoleOrderByCreatedAtDesc(User.Role role);
    List<User> findAllByOrderByCreatedAtDesc();
    long countByRole(User.Role role);
}
