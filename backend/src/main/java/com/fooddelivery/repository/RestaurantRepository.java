package com.fooddelivery.repository;

import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RestaurantRepository extends JpaRepository<Restaurant, String> {
    List<Restaurant> findByIsOpenTrue();
    List<Restaurant> findByOwner(User owner);

    @Query("SELECT r FROM Restaurant r WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :q, '%')) OR EXISTS (SELECT c FROM r.categories c WHERE LOWER(c) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Restaurant> search(@Param("q") String query);

    @Query("SELECT r FROM Restaurant r WHERE EXISTS (SELECT c FROM r.categories c WHERE LOWER(c) LIKE LOWER(CONCAT('%', :category, '%')))")
    List<Restaurant> findByCategory(@Param("category") String category);
}
