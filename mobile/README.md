# DFood — React Native Mobile App

A food delivery mobile app built with **React Native (Expo)** and **TypeScript**, faithfully implemented from the DFood Figma design (40 screens).

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Expo SDK 51 | React Native framework & build tooling |
| React Navigation v6 | Stack + Bottom Tab navigation |
| TypeScript | Type safety |
| AsyncStorage | Persist auth token locally |
| Axios | HTTP client for Spring Boot API |
| Expo Location | Device location permissions |
| @expo/vector-icons | Ionicons, MaterialCommunityIcons |
| React Native Safe Area Context | Safe area handling |

---

## Project Structure

```
mobile/
├── App.tsx                         # Root entry point
├── src/
│   ├── constants/
│   │   ├── Colors.ts               # Design system colors
│   │   └── Theme.ts                # Typography, spacing, shadows
│   ├── types/
│   │   └── index.ts                # Shared TypeScript interfaces
│   ├── context/
│   │   ├── AuthContext.tsx         # Auth state (user, token, login, logout)
│   │   └── CartContext.tsx         # Cart state (items, totals, address)
│   ├── services/
│   │   ├── api.ts                  # Axios instance + all API calls
│   │   └── mockData.ts             # Offline mock data for dev/testing
│   ├── navigation/
│   │   ├── AppNavigator.tsx        # Root navigator (auth vs main)
│   │   └── MainNavigator.tsx       # Bottom tab bar
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx          # Primary / outline / ghost button
│   │   │   └── Input.tsx           # Text input with label + password toggle
│   │   └── cards/
│   │       ├── RestaurantCard.tsx  # Restaurant listing card
│   │       └── FoodCard.tsx        # Food item grid card
│   └── screens/
│       ├── SplashScreen.tsx
│       ├── auth/
│       │   ├── OnboardingScreen.tsx        # 4-slide onboarding
│       │   ├── LocationPermissionScreen.tsx
│       │   ├── LoginScreen.tsx
│       │   ├── SignUpScreen.tsx
│       │   ├── ForgotPasswordScreen.tsx
│       │   └── VerificationScreen.tsx      # 4-digit OTP
│       └── main/
│           ├── HomeScreen.tsx              # Feed with categories + restaurants
│           ├── SearchScreen.tsx            # Search with suggestions
│           ├── RestaurantScreen.tsx        # Restaurant menu + filter modal
│           ├── FoodDetailScreen.tsx        # Food detail with size + qty picker
│           ├── CartScreen.tsx              # Cart (dark theme)
│           ├── PaymentScreen.tsx           # Payment method selector
│           ├── AddCardScreen.tsx           # Add credit/debit card
│           ├── OrderSuccessScreen.tsx
│           ├── TrackOrderScreen.tsx        # Map + order timeline
│           ├── OrdersScreen.tsx            # Ongoing / History tabs
│           ├── NotificationsScreen.tsx     # Notifications + Messages tabs
│           ├── ChatScreen.tsx              # Chat thread + inline call screen
│           ├── ProfileScreen.tsx           # Profile menu
│           ├── EditProfileScreen.tsx
│           ├── AddressScreen.tsx           # Saved addresses
│           ├── SaveLocationScreen.tsx      # Map + address form
│           └── ReviewsScreen.tsx
```

---

## Design System

| Token | Value |
|---|---|
| Primary | `#FF6B35` (orange) |
| Dark | `#1C1C2E` (navy) |
| Background | `#F5F5F5` |
| Border | `#EBEBEB` |
| Text Primary | `#1C1C2E` |
| Text Secondary | `#9B9B9B` |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator, or the **Expo Go** app on your phone

### Installation

```bash
cd food-delivery-app/mobile
npm install
```

### Run

```bash
# Start Expo dev server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

Scan the QR code with **Expo Go** (Android) or your iPhone Camera (iOS) to run on a real device.

---

## API Configuration

The app points to `http://localhost:8080/api` by default. To change this, edit [src/services/api.ts](src/services/api.ts):

```ts
const BASE_URL = 'http://localhost:8080/api'; // ← update for production
```

For a real device on the same network as your computer, replace `localhost` with your machine's local IP address (e.g. `http://192.168.1.10:8080/api`).

---

## Offline / Mock Mode

All screens work **offline out of the box** using mock data from [src/services/mockData.ts](src/services/mockData.ts). The API calls in `api.ts` are only used when a real backend is running.

To log in while the backend is offline, the app will fail gracefully with an error alert. To test the full UI flow, temporarily modify `AuthContext.tsx` to bypass the API call.

---

## Screens Overview (40 screens)

| Flow | Screens |
|---|---|
| Onboarding | Splash → Onboarding (×4) → Location Permission |
| Auth | Login → Sign Up → Forgot Password → OTP Verification |
| Home | Home feed → Search → Restaurant View → Food Detail |
| Ordering | Cart → Payment → Add Card → Order Success → Track Order |
| Account | Orders (Ongoing/History) → Notifications → Chat → Call |
| Profile | Profile → Edit Profile → Addresses → Save Location → Reviews |

---

## Build for Production

```bash
# Build APK (Android)
eas build --platform android --profile preview

# Build IPA (iOS)
eas build --platform ios --profile preview
```

Requires an [Expo EAS account](https://expo.dev) and `eas-cli` installed:
```bash
npm install -g eas-cli
eas login
eas build:configure
```
