package com.fooddelivery.service;

import com.fooddelivery.dto.request.PlaceOrderRequest;
import com.fooddelivery.dto.response.OrderResponse;
import com.fooddelivery.entity.*;
import com.fooddelivery.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final FoodItemRepository foodItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final NotificationService notificationService;

    @Transactional
    public OrderResponse placeOrder(PlaceOrderRequest request, User customer) {
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));

        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0;

        Order order = Order.builder()
                .orderNumber("#" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .customer(customer)
                .restaurant(restaurant)
                .deliveryAddress(request.getDeliveryAddress())
                .paymentMethod(request.getPaymentMethod())
                .build();

        for (PlaceOrderRequest.OrderItemRequest req : request.getItems()) {
            FoodItem food = foodItemRepository.findById(req.getFoodItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Food item not found: " + req.getFoodItemId()));

            double subtotal = food.getPrice() * req.getQuantity();
            total += subtotal;

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .foodItem(food)
                    .quantity(req.getQuantity())
                    .size(req.getSize())
                    .unitPrice(food.getPrice())
                    .subtotal(subtotal)
                    .build();

            orderItems.add(item);
        }

        order.setItems(orderItems);
        order.setTotalAmount(total);
        orderRepository.save(order);

        return OrderResponse.from(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(User customer) {
        return orderRepository.findByCustomerOrderByCreatedAtDesc(customer)
                .stream().map(OrderResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getById(String id, User customer) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalArgumentException("Access denied");
        }
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse cancelOrder(String id, User customer) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalArgumentException("Access denied");
        }
        if (order.getStatus() == Order.OrderStatus.DELIVERED || order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot cancel a " + order.getStatus().name().toLowerCase() + " order");
        }
        order.setStatus(Order.OrderStatus.CANCELLED);
        return OrderResponse.from(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updateStatus(String id, String status, User seller) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!order.getRestaurant().getOwner().getId().equals(seller.getId())) {
            throw new IllegalArgumentException("Access denied");
        }
        Order.OrderStatus newStatus;
        try {
            newStatus = Order.OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
        order.setStatus(newStatus);
        orderRepository.save(order);

        String customerMsg = switch (newStatus) {
            case CONFIRMED  -> "Your order " + order.getOrderNumber() + " has been accepted by the restaurant!";
            case PREPARING  -> "Your order " + order.getOrderNumber() + " is being prepared.";
            case CANCELLED  -> "Your order " + order.getOrderNumber() + " has been cancelled.";
            default         -> "Your order " + order.getOrderNumber() + " status: " + status;
        };
        notificationService.create(order.getCustomer(), "Order Update", customerMsg, "ORDER_UPDATE");
        return OrderResponse.from(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getSellerOrders(User seller) {
        return orderRepository.findSellerOrders(seller.getId())
                .stream().map(OrderResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getRiderOrders(User rider) {
        List<Order> active = orderRepository.findRiderActiveDeliveries(rider.getId());
        List<Order> available = orderRepository.findAvailableForPickup();
        List<Order> completed = orderRepository.findRiderCompletedDeliveries(rider.getId());

        List<OrderResponse> result = new java.util.ArrayList<>();
        result.addAll(active.stream().map(OrderResponse::from).toList());

        // Sort available orders by distance from rider's current location
        Double riderLat = rider.getLatitude();
        Double riderLng = rider.getLongitude();
        List<OrderResponse> availableResponses = available.stream()
            .map(o -> {
                OrderResponse r = OrderResponse.from(o);
                if (riderLat != null && riderLng != null) {
                    Double restLat = o.getRestaurant().getLatitude();
                    Double restLng = o.getRestaurant().getLongitude();
                    if (restLat != null && restLng != null) {
                        r.setDistanceKm(haversine(riderLat, riderLng, restLat, restLng));
                    }
                }
                return r;
            })
            .sorted(java.util.Comparator.comparingDouble(r ->
                r.getDistanceKm() != null ? r.getDistanceKm() : Double.MAX_VALUE))
            .toList();

        result.addAll(availableResponses);
        result.addAll(completed.stream().map(OrderResponse::from).toList());
        return result;
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10.0) / 10.0;
    }

    @Transactional
    public OrderResponse riderPickup(String orderId, User rider) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (order.getStatus() != Order.OrderStatus.PREPARING) {
            throw new IllegalArgumentException("Order is not ready for pickup");
        }
        if (orderRepository.existsByRiderIdAndStatus(rider.getId(), Order.OrderStatus.PICKED_UP)) {
            throw new IllegalStateException("You already have an active delivery. Complete it before picking up a new order.");
        }
        order.setRider(rider);
        order.setStatus(Order.OrderStatus.PICKED_UP);
        orderRepository.save(order);

        notificationService.create(order.getCustomer(),
            "Order On The Way",
            "Your order " + order.getOrderNumber() + " has been picked up and is on its way!", "ORDER_UPDATE");
        notificationService.create(order.getRestaurant().getOwner(),
            "Order Picked Up",
            "Order " + order.getOrderNumber() + " has been collected by " + rider.getName() + ".", "ORDER_UPDATE");
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse riderDeliver(String orderId, User rider) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (order.getRider() == null || !order.getRider().getId().equals(rider.getId())) {
            throw new IllegalArgumentException("This order is not assigned to you");
        }
        order.setStatus(Order.OrderStatus.DELIVERED);
        orderRepository.save(order);

        notificationService.create(order.getCustomer(),
            "Order Delivered",
            "Your order " + order.getOrderNumber() + " has been delivered! Enjoy your meal.", "ORDER_UPDATE");
        notificationService.create(order.getRestaurant().getOwner(),
            "Order Complete",
            "Order " + order.getOrderNumber() + " was successfully delivered.", "ORDER_UPDATE");
        notificationService.create(rider,
            "Delivery Complete",
            "You delivered order " + order.getOrderNumber() + ". Great job!", "ORDER_UPDATE");
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse rateOrder(String orderId, int rating, String comment, User customer) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!order.getCustomer().getId().equals(customer.getId()))
            throw new IllegalArgumentException("Access denied");
        if (order.getStatus() != Order.OrderStatus.DELIVERED)
            throw new IllegalArgumentException("Can only rate delivered orders");
        if (rating < 1 || rating > 5)
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        order.setRatingValue(rating);
        order.setRatingComment(comment);
        return OrderResponse.from(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSellerDashboard(User seller) {
        List<Order> all = orderRepository.findSellerOrders(seller.getId());
        long running = all.stream().filter(o -> List.of(
            Order.OrderStatus.PENDING, Order.OrderStatus.CONFIRMED, Order.OrderStatus.PREPARING
        ).contains(o.getStatus())).count();
        double revenue = all.stream()
            .filter(o -> o.getStatus() == Order.OrderStatus.DELIVERED)
            .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0)
            .sum();
        return Map.of("totalOrders", all.size(), "runningOrders", running, "revenue", revenue);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getReviewsForRestaurant(String restaurantId) {
        return orderRepository.findByRestaurantIdAndRatingValueNotNull(restaurantId).stream()
            .map(o -> Map.<String, Object>of(
                "id", o.getId(),
                "userName", o.getCustomer() != null ? o.getCustomer().getName() : "Customer",
                "rating", o.getRatingValue(),
                "comment", o.getRatingComment() != null ? o.getRatingComment() : "",
                "date", o.getCreatedAt().toString()
            )).toList();
    }
}
