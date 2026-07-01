package com.fooddelivery.service;

import com.fooddelivery.dto.response.FoodItemResponse;
import com.fooddelivery.entity.FoodItem;
import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.entity.User;
import com.fooddelivery.repository.FoodItemRepository;
import com.fooddelivery.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;
    private final RestaurantRepository restaurantRepository;

    public List<FoodItemResponse> getByRestaurant(String restaurantId, String category) {
        List<FoodItem> foods;
        if (category != null && !category.isBlank()) {
            foods = foodItemRepository.findByRestaurantIdAndCategory(restaurantId, category);
        } else {
            foods = foodItemRepository.findByRestaurantId(restaurantId);
        }
        return foods.stream().map(FoodItemResponse::from).toList();
    }

    public FoodItemResponse getById(String id) {
        return foodItemRepository.findById(id)
                .map(FoodItemResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("Food item not found"));
    }

    public List<FoodItemResponse> search(String query) {
        return foodItemRepository.search(query).stream().map(FoodItemResponse::from).toList();
    }

    public List<FoodItemResponse> getBySellerRestaurants(User seller) {
        return restaurantRepository.findByOwner(seller).stream()
            .flatMap(r -> foodItemRepository.findByRestaurant(r).stream())
            .map(FoodItemResponse::from).toList();
    }

    public List<FoodItemResponse> getBySellerRestaurant(User seller, String restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));
        if (!restaurant.getOwner().getId().equals(seller.getId()))
            throw new IllegalArgumentException("Access denied");
        return foodItemRepository.findByRestaurant(restaurant)
                .stream().map(FoodItemResponse::from).toList();
    }

    @Transactional
    public FoodItemResponse create(Map<String, Object> body, User seller) {
        String restaurantId = (String) body.get("restaurantId");
        if (restaurantId == null) throw new IllegalArgumentException("restaurantId is required");
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));
        if (!restaurant.getOwner().getId().equals(seller.getId()))
            throw new IllegalArgumentException("Access denied");

        String name = (String) body.get("name");
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Food name is required");

        @SuppressWarnings("unchecked")
        List<String> sizes = body.get("sizes") instanceof List
                ? new java.util.ArrayList<>((List<String>) body.get("sizes"))
                : new java.util.ArrayList<>();

        FoodItem food = FoodItem.builder()
                .name(name)
                .description((String) body.getOrDefault("description", ""))
                .price(body.get("price") != null ? ((Number) body.get("price")).doubleValue() : 0.0)
                .imageUrl((String) body.get("imageUrl"))
                .category((String) body.get("category"))
                .mealTime((String) body.get("mealTime"))
                .availableForDelivery(body.get("availableForDelivery") instanceof Boolean ? (Boolean) body.get("availableForDelivery") : true)
                .availableForPickup(body.get("availableForPickup") instanceof Boolean ? (Boolean) body.get("availableForPickup") : true)
                .sizes(sizes)
                .restaurant(restaurant)
                .build();
        return FoodItemResponse.from(foodItemRepository.save(food));
    }

    @Transactional
    public FoodItemResponse update(String id, Map<String, Object> body, User seller) {
        FoodItem food = foodItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Food item not found"));
        if (!food.getRestaurant().getOwner().getId().equals(seller.getId()))
            throw new IllegalArgumentException("Access denied");

        if (body.containsKey("name") && body.get("name") != null)
            food.setName((String) body.get("name"));
        if (body.containsKey("description"))
            food.setDescription((String) body.get("description"));
        if (body.containsKey("price") && body.get("price") != null)
            food.setPrice(((Number) body.get("price")).doubleValue());
        if (body.containsKey("imageUrl"))
            food.setImageUrl((String) body.get("imageUrl"));
        if (body.containsKey("category"))
            food.setCategory((String) body.get("category"));
        if (body.containsKey("mealTime"))
            food.setMealTime((String) body.get("mealTime"));
        if (body.containsKey("availableForDelivery") && body.get("availableForDelivery") instanceof Boolean)
            food.setAvailableForDelivery((Boolean) body.get("availableForDelivery"));
        if (body.containsKey("availableForPickup") && body.get("availableForPickup") instanceof Boolean)
            food.setAvailableForPickup((Boolean) body.get("availableForPickup"));
        if (body.containsKey("sizes") && body.get("sizes") instanceof List) {
            @SuppressWarnings("unchecked")
            List<String> sizes = new java.util.ArrayList<>((List<String>) body.get("sizes"));
            food.setSizes(sizes);
        }
        return FoodItemResponse.from(foodItemRepository.save(food));
    }

    @Transactional
    public void delete(String id, User seller) {
        FoodItem food = foodItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Food item not found"));
        if (!food.getRestaurant().getOwner().getId().equals(seller.getId()))
            throw new IllegalArgumentException("Access denied");
        foodItemRepository.delete(food);
    }
}
