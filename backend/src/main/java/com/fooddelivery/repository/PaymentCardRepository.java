package com.fooddelivery.repository;
import com.fooddelivery.entity.PaymentCard;
import com.fooddelivery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentCardRepository extends JpaRepository<PaymentCard, String> {
    List<PaymentCard> findByUser(User user);
}
