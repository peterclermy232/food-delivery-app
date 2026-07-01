package com.fooddelivery.repository;

import com.fooddelivery.entity.FoodItem;
import com.fooddelivery.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface FoodItemRepository extends JpaRepository<FoodItem, String> {
    List<FoodItem> findByRestaurant(Restaurant restaurant);
    List<FoodItem> findByRestaurantAndCategory(Restaurant restaurant, String category);

    @Query("SELECT f FROM FoodItem f WHERE LOWER(f.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(f.category) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<FoodItem> search(@Param("q") String query);

    List<FoodItem> findByRestaurantId(String restaurantId);
    List<FoodItem> findByRestaurantIdAndCategory(String restaurantId, String category);

    @Query("SELECT DISTINCT f.category FROM FoodItem f WHERE f.category IS NOT NULL ORDER BY f.category")
    List<String> findDistinctCategories();
}
