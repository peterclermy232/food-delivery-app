package com.fooddelivery.config;

import com.fooddelivery.entity.FoodItem;
import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.entity.User;
import com.fooddelivery.repository.FoodItemRepository;
import com.fooddelivery.repository.RestaurantRepository;
import com.fooddelivery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@Profile("!prod")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository foodItemRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Always ensure admin user exists (idempotent)
        if (userRepository.findAll().stream().noneMatch(u -> "admin@dfood.com".equals(u.getEmail()))) {
            userRepository.save(User.builder()
                    .name("Platform Admin")
                    .email("admin@dfood.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("000-000-0000")
                    .role(User.Role.ADMIN)
                    .build());
            log.info("Seeded admin account: admin@dfood.com");
        }

        // Always ensure rider user exists (idempotent)
        if (userRepository.findAll().stream().noneMatch(u -> "rider@dfood.com".equals(u.getEmail()))) {
            userRepository.save(User.builder()
                    .name("John Rider")
                    .email("rider@dfood.com")
                    .password(passwordEncoder.encode("password123"))
                    .phone("555-300-4000")
                    .role(User.Role.RIDER)
                    .latitude(-1.2950)
                    .longitude(36.8180)
                    .build());
            log.info("Seeded rider account: rider@dfood.com");
        }

        if (restaurantRepository.count() > 0) return;

        log.info("Seeding database...");

        // Users
        User customer = userRepository.save(User.builder()
                .name("Vishal Khadok")
                .email("customer@dfood.com")
                .password(passwordEncoder.encode("password123"))
                .phone("408-841-0926")
                .bio("I love fast food")
                .role(User.Role.CUSTOMER)
                .build());

        // Seller 1 — owns Rose Garden + Spicy Restaurant
        User seller = userRepository.save(User.builder()
                .name("Rose Garden Admin")
                .email("seller@dfood.com")
                .password(passwordEncoder.encode("password123"))
                .phone("555-100-2000")
                .role(User.Role.SELLER)
                .build());

        // Seller 2 — owns Uttora Coffee House only (isolated from seller 1)
        User seller2 = userRepository.save(User.builder()
                .name("Uttora Admin")
                .email("seller2@dfood.com")
                .password(passwordEncoder.encode("password123"))
                .phone("555-200-3000")
                .role(User.Role.SELLER)
                .build());

        // Restaurants — owner assignment enforces order isolation
        Restaurant r1 = restaurantRepository.save(Restaurant.builder()
                .name("Rose Garden Restaurant")
                .description("Maecenas sed diam eget risus varius blandit sit amet non magna.")
                .imageUrl(foodImage("restaurant", 1))
                .address("Westlands, Nairobi")
                .latitude(-1.2678)
                .longitude(36.8093)
                .rating(4.7)
                .deliveryFee(0.0)
                .deliveryTimeMinutes(20)
                .categories(List.of("Burger", "Chicken", "Riche", "Wings"))
                .isOpen(true)
                .owner(seller)
                .build());

        Restaurant r2 = restaurantRepository.save(Restaurant.builder()
                .name("Spicy Restaurant")
                .description("Integer posuere erat a ante venenatis dapibus posuere velit aliquet.")
                .imageUrl(foodImage("restaurant", 2))
                .address("Upper Hill, Nairobi")
                .latitude(-1.2966)
                .longitude(36.8163)
                .rating(4.7)
                .deliveryFee(0.0)
                .deliveryTimeMinutes(20)
                .categories(List.of("Burger", "Sandwich", "Pizza"))
                .isOpen(true)
                .owner(seller)
                .build());

        Restaurant r3 = restaurantRepository.save(Restaurant.builder()
                .name("Uttora Coffee House")
                .description("Coffee and light meals in a cozy atmosphere.")
                .imageUrl(foodImage("cafe", 3))
                .address("Karen, Nairobi")
                .latitude(-1.3178)
                .longitude(36.7101)
                .rating(4.5)
                .deliveryFee(0.0)
                .deliveryTimeMinutes(15)
                .categories(List.of("Coffee", "Breakfast", "Sandwiches"))
                .isOpen(true)
                .owner(seller2)
                .build());

        // Foods
        foodItemRepository.saveAll(List.of(
            FoodItem.builder().name("Burger Bistro").description("Classic beef burger with all the trimmings.").imageUrl(foodImage("burger", 1)).price(32.0).category("Burger").rating(4.7).mealTime("Breakfast").sizes(List.of("10\"", "14\"", "16\"")).availableForDelivery(true).availableForPickup(true).restaurant(r1).build(),
            FoodItem.builder().name("Chicken Thai Biriyani").description("Aromatic rice dish with tender chicken.").imageUrl(foodImage("biryani", 2)).price(60.0).category("Breakfast").rating(4.9).mealTime("Breakfast").sizes(List.of("Regular", "Large")).availableForDelivery(false).availableForPickup(true).restaurant(r1).build(),
            FoodItem.builder().name("Chicken Bhuna").description("Rich and flavorful chicken curry.").imageUrl(foodImage("curry", 3)).price(30.0).category("Breakfast").rating(4.9).mealTime("Breakfast").sizes(List.of("Regular", "Large")).availableForDelivery(false).availableForPickup(true).restaurant(r1).build(),
            FoodItem.builder().name("Mazalichiken Halim").description("Traditional halim with chicken.").imageUrl(foodImage("stew", 4)).price(25.0).category("Breakfast").rating(4.9).mealTime("Breakfast").sizes(List.of("Regular", "Large")).availableForDelivery(false).availableForPickup(true).restaurant(r1).build(),
            FoodItem.builder().name("Pizza Calzone European").description("Prosciutto e funghi topped with tomato sauce.").imageUrl(foodImage("pizza", 5)).price(32.0).category("Pizza").rating(4.7).mealTime("Lunch").sizes(List.of("10\"", "14\"", "16\"")).availableForDelivery(true).availableForPickup(true).restaurant(r2).build(),
            FoodItem.builder().name("Burger Ferguson").description("Classic beef burger.").imageUrl(foodImage("burger", 6)).price(40.0).category("Burger").rating(4.5).mealTime("All").sizes(List.of("10\"", "14\"", "16\"")).availableForDelivery(true).availableForPickup(true).restaurant(r2).build(),
            FoodItem.builder().name("Rockin' Burgers").description("Rock-solid burgers.").imageUrl(foodImage("burger", 7)).price(40.0).category("Burger").rating(4.3).mealTime("All").sizes(List.of("10\"", "14\"")).availableForDelivery(true).availableForPickup(false).restaurant(r2).build(),
            FoodItem.builder().name("Buffalo Burgers").description("Spicy buffalo-style burgers.").imageUrl(foodImage("burger", 8)).price(75.0).category("Burger").rating(4.8).mealTime("All").sizes(List.of("10\"", "14\"", "16\"")).availableForDelivery(true).availableForPickup(true).restaurant(r1).build(),
            FoodItem.builder().name("Bullseye Burgers").description("Right on target every time.").imageUrl(foodImage("burger", 9)).price(94.0).category("Burger").rating(4.6).mealTime("All").sizes(List.of("10\"", "14\"", "16\"")).availableForDelivery(true).availableForPickup(true).restaurant(r1).build(),
            FoodItem.builder().name("Smokin' Burger").description("Smoky BBQ burger.").imageUrl(foodImage("burger", 10)).price(60.0).category("Burger").rating(4.5).mealTime("Lunch").sizes(List.of("10\"", "14\"")).availableForDelivery(true).availableForPickup(false).restaurant(r1).build(),
            // Uttora Coffee House menu — visible only to seller2
            FoodItem.builder().name("Cappuccino").description("Rich espresso with steamed milk foam.").imageUrl(foodImage("cappuccino", 11)).price(5.5).category("Coffee").rating(4.8).mealTime("Breakfast").sizes(List.of("Small", "Medium", "Large")).availableForDelivery(true).availableForPickup(true).restaurant(r3).build(),
            FoodItem.builder().name("Avocado Toast").description("Toasted sourdough with fresh avocado and poached egg.").imageUrl(foodImage("avocado-toast", 12)).price(9.0).category("Breakfast").rating(4.6).mealTime("Breakfast").sizes(List.of("Regular")).availableForDelivery(true).availableForPickup(true).restaurant(r3).build(),
            FoodItem.builder().name("Club Sandwich").description("Triple-decker with chicken, bacon and salad.").imageUrl(foodImage("sandwich", 13)).price(11.0).category("Sandwiches").rating(4.5).mealTime("Lunch").sizes(List.of("Regular")).availableForDelivery(true).availableForPickup(true).restaurant(r3).build()
        ));

        log.info("Database seeded with demo accounts: customer, seller, seller2, rider");
    }

    private static String foodImage(String keyword, int seed) {
        return "https://loremflickr.com/400/300/" + keyword + "?lock=" + seed;
    }
}
