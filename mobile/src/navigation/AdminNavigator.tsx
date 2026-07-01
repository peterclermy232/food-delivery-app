import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminUsersScreen } from '../screens/admin/AdminUsersScreen';
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

const iconDashboard    = ({ color, size }: { color: string; size: number }) => <Ionicons name="grid-outline"          size={size} color={color} />;
const iconUsers        = ({ color, size }: { color: string; size: number }) => <Ionicons name="people-outline"        size={size} color={color} />;
const iconNotifications = ({ color, size }: { color: string; size: number }) => <Ionicons name="notifications-outline" size={size} color={color} />;
const iconProfile      = ({ color, size }: { color: string; size: number }) => <Ionicons name="person-outline"        size={size} color={color} />;

export const AdminNavigator = () => (
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
      name="AdminHome"
      component={AdminDashboardScreen}
      options={{ tabBarLabel: 'Dashboard', tabBarIcon: iconDashboard }}
    />
    <Tab.Screen
      name="AdminUsersTab"
      component={AdminUsersScreen}
      options={{ tabBarLabel: 'Users', tabBarIcon: iconUsers }}
    />
    <Tab.Screen
      name="AdminNotifications"
      component={NotificationsScreen}
      options={{ tabBarLabel: 'Alerts', tabBarIcon: iconNotifications }}
    />
    <Tab.Screen
      name="AdminProfile"
      component={ProfileScreen}
      options={{ tabBarLabel: 'Profile', tabBarIcon: iconProfile }}
    />
  </Tab.Navigator>
);
