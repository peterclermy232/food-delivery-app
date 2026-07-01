import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { HomeScreen } from '../screens/main/HomeScreen';
import { OrdersScreen } from '../screens/main/OrdersScreen';
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { useCart } from '../context/CartContext';

const Tab = createBottomTabNavigator();

const PlusButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.plusBtn} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.plusBtnInner}>
      <Ionicons name="add" size={28} color={Colors.white} />
    </View>
  </TouchableOpacity>
);

const PlaceholderScreen = () => <View style={{ flex: 1, backgroundColor: Colors.white }} />;

export const MainNavigator = () => {
  const { totalItems } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="MyOrders"
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="format-list-bulleted" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="AddScreen"
        component={PlaceholderScreen}
        options={{
          tabBarButton: () => <PlusButton onPress={() => {}} />,
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="notifications-outline" size={22} color={color} />,
          tabBarBadge: undefined,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 64, borderTopWidth: 1, borderTopColor: Colors.border,
    paddingBottom: 8, paddingTop: 8, backgroundColor: Colors.white,
  },
  plusBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -20,
  },
  plusBtnInner: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
});
