package com.fooddelivery.repository;

import com.fooddelivery.entity.SupportCase;
import com.fooddelivery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SupportCaseRepository extends JpaRepository<SupportCase, String> {
    List<SupportCase> findByOrderIdOrderByCreatedAtDesc(String orderId);
    List<SupportCase> findByCustomerOrderByCreatedAtDesc(User customer);

    @Query("SELECT DISTINCT sc FROM SupportCase sc " +
           "JOIN FETCH sc.order o " +
           "JOIN FETCH o.restaurant r " +
           "WHERE r.owner.id = :sellerId " +
           "ORDER BY sc.createdAt DESC")
    List<SupportCase> findSellerCases(@Param("sellerId") String sellerId);
}
