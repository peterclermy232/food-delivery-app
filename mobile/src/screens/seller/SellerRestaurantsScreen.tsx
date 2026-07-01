import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { sellerApi } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';

interface Props { navigation: any; }

export const SellerRestaurantsScreen: React.FC<Props> = ({ navigation }) => {
  const { fmt } = useCurrency();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await sellerApi.getRestaurants();
      setRestaurants(res.data.data || []);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const renderItem: ListRenderItem<any> = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardIcon}>
          <Ionicons name="storefront" size={22} color={Colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          {item.address ? <Text style={styles.cardAddress} numberOfLines={1}>{item.address}</Text> : null}
          <View style={styles.metaRow}>
            {item.deliveryFee != null && (
              <Text style={styles.meta}>{item.deliveryFee ? `${fmt(item.deliveryFee)} delivery` : 'Free delivery'}</Text>
            )}
            {item.deliveryTimeMinutes != null && (
              <Text style={styles.meta}>· {item.deliveryTimeMinutes} min</Text>
            )}
          </View>
          {(item.categories || []).length > 0 && (
            <Text style={styles.cats} numberOfLines={1}>
              {item.categories.join(' · ')}
            </Text>
          )}
        </View>
        <View style={[styles.statusDot, { backgroundColor: item.isOpen ? Colors.success : Colors.textMuted }]} />
      </View>

      <View style={styles.cardFooter}>
        <Text style={[styles.statusText, { color: item.isOpen ? Colors.success : Colors.textMuted }]}>
          {item.isOpen ? 'Open' : 'Closed'}
        </Text>
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => navigation.navigate('SellerFoods', { restaurantId: item.id, restaurantName: item.name })}
          >
            <Ionicons name="fast-food-outline" size={14} color="#6C6FE5" />
            <Text style={[styles.editBtnText, { color: '#6C6FE5' }]}>Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('AddRestaurant', { restaurant: item })}
          >
            <Ionicons name="create-outline" size={14} color={Colors.primary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Restaurants</Text>
          <Text style={styles.headerSub}>{restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddRestaurant', {})}
        >
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(true); }}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="storefront-outline" size={56} color={Colors.border} />
              <Text style={styles.emptyTitle}>No restaurants yet</Text>
              <Text style={styles.emptyText}>Tap + to add your first restaurant</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('AddRestaurant', {})}
              >
                <Text style={styles.emptyBtnText}>Add Restaurant</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F4F6FA' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, backgroundColor: Colors.white },
  headerTitle:  { fontSize: 20, fontWeight: '800', color: Colors.dark },
  headerSub:    { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  addBtn:       { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list:         { padding: 16, paddingBottom: 40, gap: 12 },
  card:         { backgroundColor: Colors.white, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardTop:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  cardIcon:     { width: 46, height: 46, borderRadius: 14, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardInfo:     { flex: 1 },
  cardName:     { fontSize: 16, fontWeight: '700', color: Colors.dark },
  cardAddress:  { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  metaRow:      { flexDirection: 'row', gap: 4, marginTop: 4 },
  meta:         { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  cats:         { fontSize: 11, color: Colors.textMuted, marginTop: 4 },
  statusDot:    { width: 10, height: 10, borderRadius: 5, marginTop: 4, flexShrink: 0 },
  cardFooter:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10 },
  statusText:   { fontSize: 13, fontWeight: '600' },
  footerActions: { flexDirection: 'row', gap: 8 },
  menuBtn:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EDEDFF', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  editBtn:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primaryLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  editBtnText:  { fontSize: 13, fontWeight: '700', color: Colors.primary },
  empty:        { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 40 },
  emptyTitle:   { fontSize: 16, fontWeight: '700', color: Colors.dark, marginTop: 14 },
  emptyText:    { fontSize: 13, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  emptyBtn:     { marginTop: 20, backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});
