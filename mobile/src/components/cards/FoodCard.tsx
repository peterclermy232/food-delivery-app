import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { FoodItem } from '../../types';

interface FoodCardProps {
  food: FoodItem;
  onPress: () => void;
  onAdd?: () => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onPress, onAdd }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imagePlaceholder} />
      <Text style={styles.name} numberOfLines={2}>{food.name}</Text>
      <Text style={styles.restaurant} numberOfLines={1}>{food.restaurantName}</Text>
      <View style={styles.footer}>
        <Text style={styles.price}>${food.price}</Text>
        {onAdd && (
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Ionicons name="add" size={18} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 150, backgroundColor: Colors.white, borderRadius: 16,
    marginRight: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  imagePlaceholder: { height: 110, backgroundColor: Colors.inputBg },
  name: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, paddingHorizontal: 10, paddingTop: 8 },
  restaurant: { fontSize: 11, color: Colors.textSecondary, paddingHorizontal: 10, paddingTop: 2, paddingBottom: 6 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, paddingBottom: 10 },
  price: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  addBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
});
