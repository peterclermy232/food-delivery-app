package com.fooddelivery.service;

import com.fooddelivery.dto.response.RestaurantResponse;
import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.entity.User;
import com.fooddelivery.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    public List<RestaurantResponse> getAll(String category, String search) {
        List<Restaurant> restaurants;
        if (search != null && !search.isBlank()) {
            restaurants = restaurantRepository.search(search);
        } else if (category != null && !category.isBlank() && !category.equalsIgnoreCase("all")) {
            restaurants = restaurantRepository.findByCategory(category);
        } else {
            restaurants = restaurantRepository.findByIsOpenTrue();
        }
        return restaurants.stream().map(RestaurantResponse::from).toList();
    }

    public RestaurantResponse getById(String id) {
        return restaurantRepository.findById(id)
                .map(RestaurantResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));
    }

    public List<RestaurantResponse> getByOwner(User owner) {
        return restaurantRepository.findByOwner(owner)
                .stream().map(RestaurantResponse::from).toList();
    }

    @Transactional
    public RestaurantResponse create(Map<String, Object> body, User owner) {
        String name = (String) body.getOrDefault("name", "");
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Restaurant name is required");

        @SuppressWarnings("unchecked")
        List<String> cats = body.get("categories") instanceof List
                ? new java.util.ArrayList<>((List<String>) body.get("categories"))
                : new java.util.ArrayList<>();

        Restaurant r = Restaurant.builder()
                .name(name)
                .description((String) body.getOrDefault("description", ""))
                .address((String) body.getOrDefault("address", ""))
                .deliveryFee(body.get("deliveryFee") != null ? ((Number) body.get("deliveryFee")).doubleValue() : 0.0)
                .deliveryTimeMinutes(body.get("deliveryTimeMinutes") != null ? ((Number) body.get("deliveryTimeMinutes")).intValue() : 30)
                .categories(cats)
                .isOpen(true)
                .owner(owner)
                .build();
        return RestaurantResponse.from(restaurantRepository.save(r));
    }

    @Transactional
    public RestaurantResponse update(String id, Map<String, Object> body, User owner) {
        Restaurant r = restaurantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));
        if (!r.getOwner().getId().equals(owner.getId()))
            throw new IllegalArgumentException("Access denied");
        if (body.containsKey("name") && body.get("name") != null)
            r.setName((String) body.get("name"));
        if (body.containsKey("description"))
            r.setDescription((String) body.get("description"));
        if (body.containsKey("address"))
            r.setAddress((String) body.get("address"));
        if (body.containsKey("deliveryFee") && body.get("deliveryFee") != null)
            r.setDeliveryFee(((Number) body.get("deliveryFee")).doubleValue());
        if (body.containsKey("deliveryTimeMinutes") && body.get("deliveryTimeMinutes") != null)
            r.setDeliveryTimeMinutes(((Number) body.get("deliveryTimeMinutes")).intValue());
        if (body.containsKey("isOpen") && body.get("isOpen") != null)
            r.setIsOpen((Boolean) body.get("isOpen"));
        if (body.containsKey("categories") && body.get("categories") instanceof List) {
            @SuppressWarnings("unchecked")
            List<String> cats = new java.util.ArrayList<>((List<String>) body.get("categories"));
            r.setCategories(cats);
        }
        return RestaurantResponse.from(restaurantRepository.save(r));
    }
}
