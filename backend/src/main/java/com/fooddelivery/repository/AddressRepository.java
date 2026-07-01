package com.fooddelivery.repository;

import com.fooddelivery.entity.Address;
import com.fooddelivery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AddressRepository extends JpaRepository<Address, String> {
    List<Address> findByUser(User user);
}
