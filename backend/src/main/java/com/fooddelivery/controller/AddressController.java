package com.fooddelivery.controller;

import com.fooddelivery.dto.response.ApiResponse;
import com.fooddelivery.entity.Address;
import com.fooddelivery.entity.User;
import com.fooddelivery.repository.AddressRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressRepository addressRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Address>>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(addressRepository.findByUser(user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Address>> create(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        Address address = Address.builder()
                .user(user)
                .fullAddress(body.get("fullAddress"))
                .street(body.get("street"))
                .postCode(body.get("postCode"))
                .apartment(body.get("apartment"))
                .label(Address.AddressLabel.valueOf(body.getOrDefault("label", "HOME").toUpperCase()))
                .build();
        return ResponseEntity.ok(ApiResponse.ok("Address added", addressRepository.save(address)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Access denied");
        }
        addressRepository.delete(address);
        return ResponseEntity.ok(ApiResponse.ok("Address deleted", null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Address>> update(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Access denied");
        }
        if (body.containsKey("fullAddress")) address.setFullAddress(body.get("fullAddress"));
        if (body.containsKey("street")) address.setStreet(body.get("street"));
        if (body.containsKey("postCode")) address.setPostCode(body.get("postCode"));
        if (body.containsKey("apartment")) address.setApartment(body.get("apartment"));
        if (body.containsKey("label")) address.setLabel(Address.AddressLabel.valueOf(body.get("label").toUpperCase()));
        return ResponseEntity.ok(ApiResponse.ok("Address updated", addressRepository.save(address)));
    }
}
