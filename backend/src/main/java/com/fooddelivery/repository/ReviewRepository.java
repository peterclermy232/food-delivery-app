package com.fooddelivery.repository;

import com.fooddelivery.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByRestaurantId(String restaurantId);
    List<Review> findByFoodItemId(String foodItemId);
}
