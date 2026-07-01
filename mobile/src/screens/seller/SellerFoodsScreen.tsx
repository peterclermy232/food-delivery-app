import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { sellerApi } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';

interface Props { navigation: any; route: any; }

export const SellerFoodsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { restaurantId, restaurantName } = route?.params || {};
  const { fmt } = useCurrency();
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await sellerApi.getFoods(restaurantId);
      setFoods(res.data.data || []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleDelete = (food: any) => {
    Alert.alert(
      'Remove Item',
      `Remove "${food.name}" from the menu?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            setDeleting(food.id);
            try {
              await sellerApi.deleteFood(food.id);
              setFoods(prev => prev.filter(f => f.id !== food.id));
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to remove item.');
            } finally {
              setDeleting(null);
            }
          },
        },
      ]
    );
  };

  const renderItem: ListRenderItem<any> = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <View style={styles.foodIcon}>
          <Ionicons name="fast-food" size={22} color={Colors.primary} />
        </View>
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{item.name}</Text>
          {item.category ? <Text style={styles.foodCat}>{item.category}</Text> : null}
          <View style={styles.metaRow}>
            <Text style={styles.price}>{fmt(item.price || 0)}</Text>
            {item.mealTime ? <Text style={styles.metaDot}>·</Text> : null}
            {item.mealTime ? <Text style={styles.mealTime}>{item.mealTime}</Text> : null}
          </View>
          {(item.sizes || []).length > 0 && (
            <Text style={styles.sizes}>{item.sizes.join(' · ')}</Text>
          )}
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('AddFood', {
              restaurantId,
              restaurantName,
              food: item,
            })}
          >
            <Ionicons name="create-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, styles.iconBtnDanger]}
            onPress={() => handleDelete(item)}
            disabled={deleting === item.id}
          >
            {deleting === item.id
              ? <ActivityIndicator size="small" color={Colors.error} />
              : <Ionicons name="trash-outline" size={18} color={Colors.error} />
            }
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.availBadge, { backgroundColor: item.availableForDelivery ? '#DCFCE7' : '#F3F4F6' }]}>
          <Ionicons name="bicycle-outline" size={12} color={item.availableForDelivery ? Colors.success : Colors.textMuted} />
          <Text style={[styles.availText, { color: item.availableForDelivery ? Colors.success : Colors.textMuted }]}>
            Delivery
          </Text>
        </View>
        <View style={[styles.availBadge, { backgroundColor: item.availableForPickup ? '#DCFCE7' : '#F3F4F6' }]}>
          <Ionicons name="bag-outline" size={12} color={item.availableForPickup ? Colors.success : Colors.textMuted} />
          <Text style={[styles.availText, { color: item.availableForPickup ? Colors.success : Colors.textMuted }]}>
            Pickup
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></View>
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.headerTitle}>Menu</Text>
          {restaurantName ? <Text style={styles.headerSub}>{restaurantName}</Text> : null}
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddFood', { restaurantId, restaurantName })}
        >
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={foods}
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
              <Ionicons name="fast-food-outline" size={56} color={Colors.border} />
              <Text style={styles.emptyTitle}>No items yet</Text>
              <Text style={styles.emptyText}>Tap + to add your first menu item</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('AddFood', { restaurantId, restaurantName })}
              >
                <Text style={styles.emptyBtnText}>Add Food Item</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F4F6FA' },
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn:        { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.inputBg, alignItems: 'center', justifyContent: 'center' },
  backArrow:      { fontSize: 24, color: Colors.dark, lineHeight: 28 },
  headerTitle:    { fontSize: 17, fontWeight: '700', color: Colors.dark },
  headerSub:      { fontSize: 12, color: Colors.primary, marginTop: 1 },
  addBtn:         { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list:           { padding: 16, paddingBottom: 48, gap: 10 },
  card:           { backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardBody:       { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  foodIcon:       { width: 46, height: 46, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  foodInfo:       { flex: 1 },
  foodName:       { fontSize: 15, fontWeight: '700', color: Colors.dark },
  foodCat:        { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  metaRow:        { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  price:          { fontSize: 14, fontWeight: '700', color: Colors.primary },
  metaDot:        { fontSize: 12, color: Colors.textMuted },
  mealTime:       { fontSize: 12, color: Colors.textSecondary },
  sizes:          { fontSize: 11, color: Colors.textMuted, marginTop: 3 },
  cardActions:    { flexDirection: 'column', gap: 8 },
  iconBtn:        { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  iconBtnDanger:  { backgroundColor: '#FEE2E2' },
  cardFooter:     { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingBottom: 12 },
  availBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  availText:      { fontSize: 11, fontWeight: '600' },
  empty:          { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 40 },
  emptyTitle:     { fontSize: 16, fontWeight: '700', color: Colors.dark, marginTop: 14 },
  emptyText:      { fontSize: 13, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  emptyBtn:       { marginTop: 20, backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText:   { fontSize: 14, fontWeight: '700', color: Colors.white },
});
