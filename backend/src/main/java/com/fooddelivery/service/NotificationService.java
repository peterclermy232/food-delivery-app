package com.fooddelivery.service;
import com.fooddelivery.entity.Notification;
import com.fooddelivery.entity.User;
import com.fooddelivery.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service @RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
            .stream().map(n -> Map.<String, Object>of(
                "id", n.getId(),
                "title", n.getTitle(),
                "message", n.getMessage(),
                "type", n.getType() != null ? n.getType() : "SYSTEM",
                "isRead", n.isRead(),
                "createdAt", n.getCreatedAt().toString()
            )).toList();
    }

    @Transactional
    public void markRead(String id, User user) {
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getUser().getId().equals(user.getId())) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void create(User user, String title, String message, String type) {
        notificationRepository.save(Notification.builder()
            .user(user).title(title).message(message).type(type).build());
    }
}
