import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { SellerDashboardScreen } from '../screens/seller/SellerDashboardScreen';
import { SellerCasesScreen } from '../screens/seller/SellerCasesScreen';
import { SellerRestaurantsScreen } from '../screens/seller/SellerRestaurantsScreen';
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

export const SellerNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        height: 64,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingBottom: 8,
        paddingTop: 8,
        backgroundColor: Colors.white,
      },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textMuted,
      tabBarShowLabel: true,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
    }}
  >
    <Tab.Screen
      name="SellerOrders"
      component={SellerDashboardScreen}
      options={{
        tabBarLabel: 'Orders',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="receipt-outline" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="SellerCases"
      component={SellerCasesScreen}
      options={{
        tabBarLabel: 'Cases',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="alert-circle-outline" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="SellerNotifications"
      component={NotificationsScreen}
      options={{
        tabBarLabel: 'Alerts',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="notifications-outline" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="SellerStores"
      component={SellerRestaurantsScreen}
      options={{
        tabBarLabel: 'Stores',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="storefront-outline" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="SellerProfile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person-outline" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);
