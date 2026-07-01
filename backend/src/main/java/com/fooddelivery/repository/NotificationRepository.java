package com.fooddelivery.repository;
import com.fooddelivery.entity.Notification;
import com.fooddelivery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
}
