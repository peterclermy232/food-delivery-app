# DFood — Spring Boot REST API

RESTful backend for the DFood food delivery app, built with **Spring Boot 3** and **Java 17**.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Spring Boot 3.2 | Application framework |
| Spring Security + JWT (jjwt 0.11) | Authentication & authorization |
| Spring Data JPA + Hibernate | ORM / database layer |
| H2 (dev) / PostgreSQL (production) | Database |
| Lombok | Boilerplate reduction |
| Bean Validation | Request validation |
| Maven | Build tool |

---

## Project Structure

```
backend/
├── pom.xml
└── src/main/
    ├── resources/
    │   └── application.properties          # Config (DB, JWT, CORS)
    └── java/com/fooddelivery/
        ├── FoodDeliveryApplication.java    # Main entry point
        ├── config/
        │   ├── SecurityConfig.java         # JWT filter chain, CORS, BCrypt
        │   ├── DataSeeder.java             # Seeds restaurants, foods, users on startup
        │   └── GlobalExceptionHandler.java # Unified error responses
        ├── security/
        │   ├── JwtService.java             # Token generate / validate
        │   └── JwtAuthFilter.java          # OncePerRequestFilter
        ├── entity/
        │   ├── User.java                   # Implements UserDetails
        │   ├── Restaurant.java
        │   ├── FoodItem.java
        │   ├── Order.java
        │   ├── OrderItem.java
        │   ├── Address.java
        │   └── Review.java
        ├── repository/                     # Spring Data JPA interfaces
        ├── dto/
        │   ├── request/                    # RegisterRequest, LoginRequest, PlaceOrderRequest
        │   └── response/                   # ApiResponse<T>, AuthResponse, UserResponse, ...
        ├── service/
        │   ├── AuthService.java
        │   ├── RestaurantService.java
        │   ├── FoodItemService.java
        │   └── OrderService.java
        └── controller/
            ├── AuthController.java
            ├── RestaurantController.java
            ├── FoodController.java
            ├── OrderController.java
            ├── ProfileController.java
            └── AddressController.java
```

---

## Getting Started

### Prerequisites
- Java 17+
- Maven 3.8+ (or use the included `mvnw` wrapper)

### Run (Development — H2 in-memory DB)

```bash
cd food-delivery-app/backend
./mvnw spring-boot:run
```

The API starts at **http://localhost:8080**.

H2 console (dev only): **http://localhost:8080/h2-console**
- JDBC URL: `jdbc:h2:mem:fooddeliverydb`
- Username: `sa` | Password: *(empty)*

---

## Seed Data

On first startup, `DataSeeder` automatically creates:

| Role | Email | Password |
|---|---|---|
| Customer | `customer@dfood.com` | `password123` |
| Seller | `seller@dfood.com` | `password123` |

3 restaurants and 10 food items are also seeded.

---

## API Reference

All responses follow this envelope:

```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### Auth — Public

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | `{ name, email, password, phone, role }` | Register a new user |
| `POST` | `/api/auth/login` | `{ email, password }` | Login, returns JWT token |
| `POST` | `/api/auth/forgot-password` | `{ email }` | Request password reset code |
| `POST` | `/api/auth/verify-otp` | `{ email, otp }` | Verify OTP code |

**Register example:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"secret123","phone":"0700000000"}'
```

**Login response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": { "id": "...", "name": "John Doe", "email": "john@example.com", "role": "customer" }
  }
}
```

All subsequent requests require:
```
Authorization: Bearer <token>
```

---

### Restaurants — Public

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/restaurants` | `category`, `search` | List open restaurants |
| `GET` | `/api/restaurants/{id}` | — | Get restaurant by ID |
| `GET` | `/api/restaurants/{id}/foods` | `category` | Get foods for a restaurant |

---

### Foods — Public

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/foods/{id}` | — | Get food item by ID |
| `GET` | `/api/foods/search` | `q` | Search foods by name/category |

---

### Orders — Requires Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/orders` | `PlaceOrderRequest` | Place a new order |
| `GET` | `/api/orders` | — | Get current user's orders |
| `GET` | `/api/orders/{id}` | — | Get order by ID |
| `GET` | `/api/orders/{id}/track` | — | Track order status |
| `PUT` | `/api/orders/{id}/cancel` | — | Cancel an order |

**Place order example:**
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "...",
    "deliveryAddress": "123 Main St",
    "paymentMethod": "mastercard",
    "items": [
      { "foodItemId": "...", "quantity": 2, "size": "14\"" }
    ]
  }'
```

---

### Profile — Requires Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `GET` | `/api/profile` | — | Get current user's profile |
| `PUT` | `/api/profile` | `{ name, phone, bio }` | Update profile |

---

### Addresses — Requires Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `GET` | `/api/addresses` | — | List saved addresses |
| `POST` | `/api/addresses` | `{ label, fullAddress, street, postCode, apartment }` | Add address |
| `DELETE` | `/api/addresses/{id}` | — | Delete address |

---

## Production Setup (PostgreSQL)

1. Create a PostgreSQL database.
2. Uncomment the PostgreSQL block in [src/main/resources/application.properties](src/main/resources/application.properties):

```properties
spring.datasource.url=${DATABASE_URL}
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```

3. Set environment variables:

```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/fooddelivery
export DB_USERNAME=postgres
export DB_PASSWORD=yourpassword
export APP_JWT_SECRET=your-very-long-base64-encoded-secret-key
```

4. Build the JAR:

```bash
./mvnw clean package -DskipTests
java -jar target/food-delivery-api-1.0.0.jar
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `server.port` | `8080` | Server port |
| `app.jwt.secret` | *(set in properties)* | Base64 JWT signing key |
| `app.jwt.expiration` | `86400000` | Token TTL in ms (24 hours) |
| `DATABASE_URL` | H2 in-memory | PostgreSQL JDBC URL |
| `DB_USERNAME` | `sa` | Database username |
| `DB_PASSWORD` | *(empty)* | Database password |

---

## Data Model

```
User ──< Order >── Restaurant
                       │
                    FoodItem
                       │
                  OrderItem
User ──< Address
User ──< Review >── Restaurant / FoodItem
```

---

## Running Tests

```bash
./mvnw test
```
