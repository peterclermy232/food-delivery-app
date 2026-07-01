import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { RiderDashboardScreen } from '../screens/rider/RiderDashboardScreen';
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

export const RiderNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        height: 64, borderTopWidth: 1, borderTopColor: Colors.border,
        paddingBottom: 8, paddingTop: 8, backgroundColor: Colors.white,
      },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textMuted,
      tabBarShowLabel: true,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
    }}
  >
    <Tab.Screen
      name="RiderDeliveries"
      component={RiderDashboardScreen}
      options={{
        tabBarLabel: 'Deliveries',
        tabBarIcon: ({ color, size }) => <Ionicons name="bicycle-outline" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="RiderNotifications"
      component={NotificationsScreen}
      options={{
        tabBarLabel: 'Alerts',
        tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="RiderProfile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
      }}
    />
  </Tab.Navigator>
);
