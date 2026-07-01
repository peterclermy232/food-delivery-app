import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { RestaurantCard } from '../../components/cards/RestaurantCard';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { restaurantApi, categoryApi } from '../../services/api';

interface Props { navigation: any; }

const CATEGORY_EMOJIS: Record<string, string> = {
  'All': '🍽', 'Burger': '🍔', 'Pizza': '🍕', 'Chicken': '🍗',
  'Coffee': '☕', 'Breakfast': '🍳', 'Sandwich': '🥪', 'Wings': '🍖',
  'Riche': '🍚', 'Noodles': '🍜', 'Hot Dog': '🌭',
};

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

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { totalItems, deliveryAddress } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showOffer, setShowOffer] = useState(true);
  const location = deliveryAddress || 'Set delivery location';
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  let greeting = 'Good Evening';
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 17) greeting = 'Good Afternoon';

  useEffect(() => {
    const load = async () => {
      try {
        const rRes = await restaurantApi.getAll();
        const mapped = (rRes.data.data || []).map(mapRestaurant);
        setRestaurants(mapped);
        const allCats = ['All', ...mapped.flatMap((r: any) => r.categories)];
        setCategories([...new Set(allCats)] as string[]);
        categoryApi.getAll().then(cRes => {
          const cats = ['All', ...(cRes.data.data || [])];
          setCategories([...new Set(cats)] as string[]);
        }).catch(() => {});
      } catch (e) {
        console.error('Failed to load home data', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredRestaurants = selectedCategory === 'All'
    ? restaurants
    : restaurants.filter(r => r.categories.some((c: string) => c.toLowerCase().includes(selectedCategory.toLowerCase())));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Offer Modal */}
      <Modal visible={showOffer} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.offerModal}>
            <TouchableOpacity style={styles.offerClose} onPress={() => setShowOffer(false)}>
              <Ionicons name="close" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.offerTitle}>Hurry Offers!</Text>
            <Text style={styles.offerCode}>#1243CD2</Text>
            <Text style={styles.offerDesc}>Use the coupon get 25% discount</Text>
            <TouchableOpacity style={styles.offerBtn} onPress={() => setShowOffer(false)}>
              <Text style={styles.offerBtnText}>GOT IT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="menu" size={24} color={Colors.dark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.locationBtn} onPress={() => navigation.navigate('Addresses')}>
            <Text style={styles.deliverTo}>DELIVER TO</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.dark} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
            <MaterialCommunityIcons name="shopping-outline" size={24} color={Colors.white} />
            {totalItems > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Hey {firstName}, <Text style={styles.greetingBold}>{greeting}!</Text></Text>
        </View>

        {/* Search */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>Search dishes, restaurants</Text>
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All &gt;</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories.map((name, i) => ({ id: String(i), name }))}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryItem, selectedCategory === item.name && styles.categorySelected]}
              onPress={() => setSelectedCategory(item.name)}
            >
              <View style={[styles.categoryIcon, selectedCategory === item.name && styles.categoryIconSelected]}>
                <Text style={styles.categoryEmoji}>{CATEGORY_EMOJIS[item.name] || '🍽'}</Text>
              </View>
              <Text style={[styles.categoryName, selectedCategory === item.name && styles.categoryNameSelected]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Open Restaurants */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Open Restaurants</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.seeAll}>See All &gt;</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.restaurantList}>
            {filteredRestaurants.map(restaurant => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onPress={() => navigation.navigate('Restaurant', { restaurant })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  locationBtn: { alignItems: 'center' },
  deliverTo: { fontSize: 10, fontWeight: '600', color: Colors.primary, letterSpacing: 0.8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 14, fontWeight: '600', color: Colors.dark },
  cartBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.dark, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18,
    backgroundColor: Colors.primary, borderRadius: 9, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: Colors.white },
  greeting: { paddingHorizontal: 20, paddingVertical: 12 },
  greetingText: { fontSize: 18, color: Colors.dark },
  greetingBold: { fontWeight: '700' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.inputBg, borderRadius: 12, height: 48,
    marginHorizontal: 20, paddingHorizontal: 16, marginBottom: 20,
  },
  searchPlaceholder: { fontSize: 14, color: Colors.textMuted },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  seeAll: { fontSize: 13, color: Colors.dark },
  categoryList: { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  categoryItem: {
    alignItems: 'center', backgroundColor: Colors.white, borderRadius: 16,
    padding: 12, minWidth: 90, borderWidth: 1.5, borderColor: Colors.border,
  },
  categorySelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  categoryIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.inputBg, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  categoryIconSelected: { backgroundColor: Colors.primary },
  categoryEmoji: { fontSize: 22 },
  categoryName: { fontSize: 12, fontWeight: '600', color: Colors.dark },
  categoryNameSelected: { color: Colors.primary },
  categoryPrice: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  restaurantList: { paddingHorizontal: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  offerModal: {
    backgroundColor: Colors.primary, borderRadius: 20, padding: 32, width: '80%',
    alignItems: 'center', overflow: 'hidden',
  },
  offerClose: {
    position: 'absolute', top: 12, right: 12, width: 28, height: 28,
    borderRadius: 14, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  offerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white, textAlign: 'center', marginBottom: 8 },
  offerCode: { fontSize: 28, fontWeight: '900', color: Colors.white, marginBottom: 8 },
  offerDesc: { fontSize: 14, color: Colors.white, textAlign: 'center', marginBottom: 20 },
  offerBtn: { backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 40, paddingVertical: 14 },
  offerBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});
