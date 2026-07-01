import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Restaurant } from '../../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  horizontal?: boolean;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onPress, horizontal }) => {
  return (
    <TouchableOpacity style={[styles.card, horizontal && styles.horizontal]} onPress={onPress} activeOpacity={0.9}>
      <View style={[styles.imagePlaceholder, horizontal && styles.horizontalImage]}>
        {restaurant.image ? (
          <Image source={{ uri: restaurant.image }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        ) : null}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.categories} numberOfLines={1}>
          {restaurant.categories.join(' - ')}
        </Text>
        <View style={styles.meta}>
          <Ionicons name="star-outline" size={14} color={Colors.primary} />
          <Text style={styles.metaText}>{restaurant.rating}</Text>
          <View style={styles.dot} />
          <MaterialCommunityIcons name="truck-delivery-outline" size={14} color={Colors.primary} />
          <Text style={styles.metaText}>
            {restaurant.deliveryFee === 'Free' ? 'Free' : `$${restaurant.deliveryFee}`}
          </Text>
          <View style={styles.dot} />
          <Ionicons name="time-outline" size={14} color={Colors.primary} />
          <Text style={styles.metaText}>{restaurant.deliveryTime} min</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  horizontal: { flexDirection: 'row', height: 90, alignItems: 'center' },
  imagePlaceholder: {
    height: 160, backgroundColor: Colors.inputBg, width: '100%',
  },
  horizontalImage: { width: 70, height: 70, borderRadius: 10, margin: 10 },
  info: { padding: 12 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  categories: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.textSecondary },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.textMuted, marginHorizontal: 2 },
});
