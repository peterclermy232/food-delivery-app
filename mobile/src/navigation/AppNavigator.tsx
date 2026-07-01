import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { LocationPermissionScreen } from '../screens/auth/LocationPermissionScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { VerificationScreen } from '../screens/auth/VerificationScreen';
import { MainNavigator } from './MainNavigator';
import { SellerNavigator } from './SellerNavigator';
import { RiderNavigator } from './RiderNavigator';
import { AdminNavigator } from './AdminNavigator';
import { AdminUsersScreen } from '../screens/admin/AdminUsersScreen';
import { OnboardUserScreen } from '../screens/admin/OnboardUserScreen';

import { CartScreen } from '../screens/main/CartScreen';
import { PaymentScreen } from '../screens/main/PaymentScreen';
import { AddCardScreen } from '../screens/main/AddCardScreen';
import { OrderSuccessScreen } from '../screens/main/OrderSuccessScreen';
import { TrackOrderScreen } from '../screens/main/TrackOrderScreen';
import { SearchScreen } from '../screens/main/SearchScreen';
import { RestaurantScreen } from '../screens/main/RestaurantScreen';
import { FoodDetailScreen } from '../screens/main/FoodDetailScreen';
import { OrdersScreen } from '../screens/main/OrdersScreen';
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { ChatScreen } from '../screens/main/ChatScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { EditProfileScreen } from '../screens/main/EditProfileScreen';
import { AddressScreen } from '../screens/main/AddressScreen';
import { SaveLocationScreen } from '../screens/main/SaveLocationScreen';
import { ReviewsScreen } from '../screens/main/ReviewsScreen';
import { RaiseCaseScreen } from '../screens/main/RaiseCaseScreen';
import { MyCasesScreen } from '../screens/main/MyCasesScreen';
import { AddRestaurantScreen } from '../screens/seller/AddRestaurantScreen';
import { SellerFoodsScreen } from '../screens/seller/SellerFoodsScreen';
import { AddFoodScreen } from '../screens/seller/AddFoodScreen';

const Stack = createNativeStackNavigator();

const AuthScreens = () => (
  <>
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="LocationPermission" component={LocationPermissionScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="Verification" component={VerificationScreen} />
  </>
);

const AdminScreens = () => (
  <>
    <Stack.Screen name="Main" component={AdminNavigator} />
    <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
    <Stack.Screen name="OnboardUser" component={OnboardUserScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </>
);

const RiderScreens = () => (
  <>
    <Stack.Screen name="Main" component={RiderNavigator} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Addresses" component={AddressScreen} />
    <Stack.Screen name="SaveLocation" component={SaveLocationScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </>
);

const SellerScreens = () => (
  <>
    <Stack.Screen name="Main" component={SellerNavigator} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Addresses" component={AddressScreen} />
    <Stack.Screen name="SaveLocation" component={SaveLocationScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
    <Stack.Screen name="AddRestaurant" component={AddRestaurantScreen} />
    <Stack.Screen name="SellerFoods" component={SellerFoodsScreen} />
    <Stack.Screen name="AddFood" component={AddFoodScreen} />
  </>
);

const CustomerScreens = () => (
  <>
    <Stack.Screen name="Main" component={MainNavigator} />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen name="AddCard" component={AddCardScreen} />
    <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
    <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
    <Stack.Screen name="Search" component={SearchScreen} />
    <Stack.Screen name="Restaurant" component={RestaurantScreen} />
    <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
    <Stack.Screen name="Orders" component={OrdersScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Addresses" component={AddressScreen} />
    <Stack.Screen name="SaveLocation" component={SaveLocationScreen} />
    <Stack.Screen name="Reviews" component={ReviewsScreen} />
    <Stack.Screen name="RaiseCase" component={RaiseCaseScreen} />
    <Stack.Screen name="MyCases" component={MyCasesScreen} />
  </>
);

const ROLE_SCREENS: Record<string, () => React.ReactElement> = {
  admin:    AdminScreens,
  rider:    RiderScreens,
  seller:   SellerScreens,
  customer: CustomerScreens,
};

export const AppNavigator = () => {
  const { user } = useAuth();

  const renderScreens = () => {
    if (!user) return AuthScreens();
    return (ROLE_SCREENS[user.role] ?? CustomerScreens)();
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {renderScreens()}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
