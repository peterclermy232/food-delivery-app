package com.fooddelivery.repository;

import com.fooddelivery.entity.Order;
import com.fooddelivery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByCustomerOrderByCreatedAtDesc(User customer);
    List<Order> findByRestaurantOwnerOrderByCreatedAtDesc(User owner);
    List<Order> findByRestaurantOwnerAndStatusOrderByCreatedAtDesc(User owner, Order.OrderStatus status);

    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN FETCH o.restaurant r " +
           "LEFT JOIN FETCH o.items " +
           "WHERE r.owner.id = :ownerId " +
           "ORDER BY o.createdAt DESC")
    List<Order> findSellerOrders(@Param("ownerId") String ownerId);

    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN FETCH o.restaurant r " +
           "LEFT JOIN FETCH o.items " +
           "WHERE o.status = 'PREPARING' " +
           "ORDER BY o.createdAt ASC")
    List<Order> findAvailableForPickup();

    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN FETCH o.restaurant r " +
           "LEFT JOIN FETCH o.items " +
           "WHERE o.rider.id = :riderId AND o.status = 'PICKED_UP' " +
           "ORDER BY o.createdAt DESC")
    List<Order> findRiderActiveDeliveries(@Param("riderId") String riderId);

    boolean existsByRiderIdAndStatus(String riderId, Order.OrderStatus status);

    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN FETCH o.restaurant r " +
           "LEFT JOIN FETCH o.items " +
           "WHERE o.rider.id = :riderId AND o.status = 'DELIVERED' " +
           "ORDER BY o.createdAt DESC")
    List<Order> findRiderCompletedDeliveries(@Param("riderId") String riderId);

    @Query("SELECT o FROM Order o WHERE o.restaurant.id = :restaurantId AND o.ratingValue IS NOT NULL")
    List<Order> findByRestaurantIdAndRatingValueNotNull(@Param("restaurantId") String restaurantId);
}
