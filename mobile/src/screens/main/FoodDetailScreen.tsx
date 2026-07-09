import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { FoodItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

interface Props { navigation: any; route: any; }

export const FoodDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { food } = route.params as { food: FoodItem };
  const { addItem } = useCart();
  const { fmt } = useCurrency();
  const [selectedSize, setSelectedSize] = useState(food.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(2);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = () => {
    addItem(food, quantity, selectedSize);
    navigation.navigate('Cart');
  };

  return (
    <View style={styles.container}>
      {/* Hero Image */}
      <View style={styles.hero}>
        {food.image ? (
          <Image source={{ uri: food.image }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        ) : null}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteBtn} onPress={() => setIsFavorite(!isFavorite)}>
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? Colors.primary : Colors.dark} />
        </TouchableOpacity>

        {/* Tags overlay */}
        <View style={styles.tagsRow}>
          {(food.mealTime || food.category) ? (
            <View style={styles.tag}><Text style={styles.tagText}>{food.mealTime || food.category}</Text></View>
          ) : <View />}
          <View style={styles.dotsIndicator}>
            {[0, 1, 2, 3, 4].map(i => (
              <View key={i} style={[styles.dot, i === 2 && styles.dotActive]} />
            ))}
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{food.availableForDelivery === true ? 'Delivery' : 'Pickup Only'}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Restaurant chip */}
        <View style={styles.restaurantChip}>
          <View style={styles.restaurantDot} />
          <Text style={styles.restaurantName}>{food.restaurantName}</Text>
        </View>

        {/* Title & price */}
        <View style={styles.titleRow}>
          <Text style={styles.foodName}>{food.name}</Text>
          <Text style={styles.price}>{fmt(food.price)}</Text>
        </View>

        {/* Meta */}
        <View style={styles.metaRow}>
          <Ionicons name="star-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{food.rating > 0 ? food.rating : 'New'}</Text>
          <View style={styles.separator} />
          <MaterialCommunityIcons name="truck-delivery-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{food.availableForDelivery === true ? 'Delivery' : 'Pickup only'}</Text>
        </View>

        <Text style={styles.description}>{food.description}</Text>

        {/* Size */}
        {(food.sizes || []).length > 0 && (
          <>
            <Text style={styles.sectionLabel}>SIZE:</Text>
            <View style={styles.sizeRow}>
              {(food.sizes || []).map(size => (
                <TouchableOpacity
                  key={size}
                  style={[styles.sizeBtn, selectedSize === size && styles.sizeBtnActive]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text style={[styles.sizeBtnText, selectedSize === size && styles.sizeBtnTextActive]}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Ingredients */}
        {(food.ingredients || []).length > 0 && (
          <>
            <Text style={styles.sectionLabel}>INGREDIENTS</Text>
            <View style={styles.ingredientRow}>
              {(food.ingredients || []).map(ing => (
                <View key={ing.id} style={styles.ingredientItem}>
                  <View style={[styles.ingredientIcon, ing.isAllergen && styles.ingredientIconAllergen]}>
                    <Text style={styles.ingredientEmoji}>🧅</Text>
                  </View>
                  <Text style={styles.ingredientName} numberOfLines={1}>{ing.name}</Text>
                  {ing.isAllergen && <Text style={styles.allergen}>(Allergen)</Text>}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.priceSection}>
          <Text style={styles.footerPrice}>{fmt(food.price * quantity)}</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity style={styles.qBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
              <Ionicons name="remove" size={18} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.quantity}>{quantity}</Text>
            <TouchableOpacity style={styles.qBtn} onPress={() => setQuantity(quantity + 1)}>
              <Ionicons name="add" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
          <Text style={styles.addBtnText}>ADD TO CART</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  hero: {
    height: 260, backgroundColor: Colors.inputBg,
    justifyContent: 'space-between', padding: 20, paddingTop: 56,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  favoriteBtn: { position: 'absolute', top: 56, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, color: Colors.dark, lineHeight: 28 },
  tagsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tag: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6 },
  tagText: { fontSize: 12, fontWeight: '600', color: Colors.dark },
  dotsIndicator: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: Colors.primary, width: 16 },
  content: { flex: 1, paddingHorizontal: 20 },
  restaurantChip: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 8 },
  restaurantDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.primary },
  restaurantName: { fontSize: 13, fontWeight: '600', color: Colors.dark },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  foodName: { fontSize: 20, fontWeight: '700', color: Colors.dark, flex: 1, marginRight: 12 },
  price: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  metaText: { fontSize: 13, color: Colors.textSecondary },
  separator: { width: 1, height: 12, backgroundColor: Colors.border },
  description: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.8, marginBottom: 10 },
  sizeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  sizeBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border },
  sizeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sizeBtnText: { fontSize: 13, color: Colors.dark },
  sizeBtnTextActive: { color: Colors.white, fontWeight: '600' },
  ingredientRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  ingredientItem: { alignItems: 'center', width: 60 },
  ingredientIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  ingredientIconAllergen: { backgroundColor: Colors.primaryLight },
  ingredientEmoji: { fontSize: 20 },
  ingredientName: { fontSize: 10, color: Colors.dark, textAlign: 'center' },
  allergen: { fontSize: 9, color: Colors.primary, textAlign: 'center' },
  footer: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  priceSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  footerPrice: { fontSize: 22, fontWeight: '700', color: Colors.dark },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: Colors.dark, borderRadius: 24, paddingHorizontal: 8, paddingVertical: 6 },
  qBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quantity: { fontSize: 16, fontWeight: '700', color: Colors.white, minWidth: 20, textAlign: 'center' },
  addBtn: { backgroundColor: Colors.primary, borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white, letterSpacing: 1.2 },
});
