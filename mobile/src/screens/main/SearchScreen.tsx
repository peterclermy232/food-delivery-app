import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { restaurantApi, foodApi } from '../../services/api';
import { FoodCard } from '../../components/cards/FoodCard';
import { useCart } from '../../context/CartContext';

interface Props { navigation: any; }

const mapRestaurant = (r: any) => ({
  id: r.id,
  name: r.name,
  description: r.description,
  image: r.imageUrl,
  rating: r.rating || 0,
  deliveryFee: r.deliveryFee === 0 ? 'Free' : r.deliveryFee,
  deliveryTime: r.deliveryTimeMinutes || 20,
  categories: r.categories || [],
  address: r.address,
  isOpen: r.isOpen !== false,
});

const mapFood = (f: any) => ({
  id: f.id,
  restaurantId: f.restaurantId,
  restaurantName: f.restaurantName,
  name: f.name,
  description: f.description,
  price: f.price,
  image: f.imageUrl,
  category: f.category,
  rating: f.rating || 0,
  reviewCount: 0,
  ingredients: [],
  sizes: f.sizes?.length > 0 ? f.sizes : ['Regular'],
  availableForDelivery: f.availableForDelivery !== false,
  availableForPickup: f.availableForPickup !== false,
  mealTime: f.mealTime,
});

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setRestaurants([]);
      setFoods([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const [rRes, fRes] = await Promise.all([
          restaurantApi.getAll({ search: query }),
          foodApi.search(query),
        ]);
        setRestaurants((rRes.data.data || []).map(mapRestaurant));
        setFoods((fRes.data.data || []).map(mapFood));
      } catch (e) {
        console.error('Search failed', e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search dishes, restaurants"
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <View style={styles.cartDark}>
            <Ionicons name="basket-outline" size={20} color={Colors.white} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 32 }} />
        ) : query.trim() === '' ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Search for dishes or restaurants</Text>
          </View>
        ) : (
          <>
            {/* Restaurant Results */}
            {restaurants.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Restaurants</Text>
                {restaurants.map(r => (
                  <TouchableOpacity key={r.id} style={styles.restaurantRow} onPress={() => navigation.navigate('Restaurant', { restaurant: r })}>
                    <View style={styles.restaurantThumb} />
                    <View style={styles.restaurantInfo}>
                      <Text style={styles.restaurantName}>{r.name}</Text>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color={Colors.primary} />
                        <Text style={styles.ratingText}>{r.rating}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Food Results */}
            {foods.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dishes</Text>
                <FlatList
                  data={foods}
                  horizontal
                  keyExtractor={item => item.id}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <FoodCard
                      food={item}
                      onPress={() => navigation.navigate('FoodDetail', { food: item })}
                      onAdd={() => addItem(item, 1, item.sizes[0])}
                    />
                  )}
                />
              </View>
            )}

            {/* No results */}
            {restaurants.length === 0 && foods.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyText}>No results for "{query}"</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.inputBg, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, color: Colors.dark, lineHeight: 28 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.inputBg, borderRadius: 12, height: 44, paddingHorizontal: 12 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.dark },
  cartDark: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.dark, alignItems: 'center', justifyContent: 'center' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark, marginBottom: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  chipText: { fontSize: 13, color: Colors.dark },
  restaurantRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  restaurantThumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: Colors.inputBg },
  restaurantInfo: { flex: 1 },
  restaurantName: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, color: Colors.textSecondary },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 64, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textMuted },
});
