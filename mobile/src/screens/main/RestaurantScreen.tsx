import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { foodApi } from '../../services/api';
import { FoodCard } from '../../components/cards/FoodCard';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

interface Props { navigation: any; route: any; }

const tabs = ['Burger', 'Sandwich', 'Pizza', 'Sanwich'];
const filterOffers = ['Delivery', 'Pick Up', 'Offer', 'Online payment available'];
const filterTimes = ['10-15 min', '20 min', '30 min'];
const filterPrices = ['$', '$$', '$$$'];

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

export const RestaurantScreen: React.FC<Props> = ({ navigation, route }) => {
  const { restaurant } = route.params;
  const { addItem } = useCart();
  const { fmt } = useCurrency();
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedTime, setSelectedTime] = useState('10-15 min');
  const [selectedPrice, setSelectedPrice] = useState('$$');
  const [selectedRating, setSelectedRating] = useState(4);
  const [allFoods, setAllFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await foodApi.getByRestaurant(restaurant.id);
        const mapped = (response.data?.data || []).map(mapFood);
        setAllFoods(mapped);
      } catch (err) {
        console.error('Failed to fetch foods:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, [restaurant.id]);

  const foods = allFoods.filter(f =>
    f.category?.toLowerCase().includes(selectedTab.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.dark} />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <ScrollView style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.description} numberOfLines={3}>{restaurant.description}</Text>
          <View style={styles.metaRow}>
            <TouchableOpacity
              style={styles.metaRow}
              onPress={() => navigation.navigate('Reviews', { restaurantId: restaurant.id, restaurantName: restaurant.name })}
            >
              <Ionicons name="star-outline" size={14} color={Colors.primary} />
              <Text style={styles.metaText}>{restaurant.rating}</Text>
            </TouchableOpacity>
            <View style={styles.dot} />
            <MaterialCommunityIcons name="truck-delivery-outline" size={14} color={Colors.primary} />
            <Text style={styles.metaText}>{!restaurant.deliveryFee ? 'Free' : fmt(restaurant.deliveryFee)}</Text>
            <View style={styles.dot} />
            <Ionicons name="time-outline" size={14} color={Colors.primary} />
            <Text style={styles.metaText}>{restaurant.deliveryTime} min</Text>
          </View>
        </View>

        {/* Category tabs */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tabs}
          keyExtractor={t => t}
          contentContainerStyle={styles.tabs}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tab, selectedTab === item && styles.tabActive]}
              onPress={() => setSelectedTab(item)}
            >
              <Text style={[styles.tabText, selectedTab === item && styles.tabTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Food count + filter */}
        <View style={styles.subHeader}>
          <Text style={styles.foodCount}>{selectedTab} ({foods.length})</Text>
          <TouchableOpacity onPress={() => setShowFilter(true)}>
            <Ionicons name="options" size={22} color={Colors.dark} />
          </TouchableOpacity>
        </View>

        {/* Food grid */}
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : (
          <View style={styles.grid}>
            {foods.map((food: any) => (
              <View key={food.id} style={styles.gridItem}>
                <FoodCard
                  food={food}
                  onPress={() => navigation.navigate('FoodDetail', { food })}
                  onAdd={() => addItem(food, 1, food.sizes[0])}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={showFilter} transparent animationType="slide">
        <View style={styles.filterOverlay}>
          <View style={styles.filterSheet}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filter your search</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <View style={styles.filterClose}>
                  <Ionicons name="close" size={18} color={Colors.dark} />
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>OFFERS</Text>
            <View style={styles.chipRow}>
              {filterOffers.map(o => (
                <TouchableOpacity key={o} style={styles.chip}>
                  <Text style={styles.chipText}>{o}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>DELIVER TIME</Text>
            <View style={styles.chipRow}>
              {filterTimes.map(t => (
                <TouchableOpacity key={t} style={[styles.chip, selectedTime === t && styles.chipActive]} onPress={() => setSelectedTime(t)}>
                  <Text style={[styles.chipText, selectedTime === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>PRICING</Text>
            <View style={styles.chipRow}>
              {filterPrices.map(p => (
                <TouchableOpacity key={p} style={[styles.chip, selectedPrice === p && styles.chipActive]} onPress={() => setSelectedPrice(p)}>
                  <Text style={[styles.chipText, selectedPrice === p && styles.chipTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>RATING</Text>
            <View style={styles.chipRow}>
              {[1, 2, 3, 4, 5].map(r => (
                <TouchableOpacity key={r} style={[styles.ratingChip, r <= selectedRating && styles.ratingChipActive]} onPress={() => setSelectedRating(r)}>
                  <Ionicons name="star" size={18} color={r <= selectedRating ? Colors.white : Colors.border} />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilter(false)}>
              <Text style={styles.filterBtnText}>FILTER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  hero: {
    height: 220, backgroundColor: Colors.inputBg,
    flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 56,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  moreBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, color: Colors.dark, lineHeight: 28 },
  content: { flex: 1 },
  infoSection: { padding: 20 },
  name: { fontSize: 20, fontWeight: '700', color: Colors.dark, marginBottom: 6 },
  description: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: Colors.textSecondary },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.textMuted },
  tabs: { paddingHorizontal: 20, gap: 10, paddingBottom: 16 },
  tab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 13, color: Colors.dark },
  tabTextActive: { color: Colors.white, fontWeight: '600' },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  foodCount: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  loader: { marginTop: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  gridItem: { width: '47%' },
  filterOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  filterSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  filterTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  filterClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.inputBg, alignItems: 'center', justifyContent: 'center' },
  filterLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.8, marginBottom: 10, marginTop: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.dark },
  chipTextActive: { color: Colors.white },
  ratingChip: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  ratingChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterBtn: { backgroundColor: Colors.primary, borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  filterBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white, letterSpacing: 1.2 },
});
