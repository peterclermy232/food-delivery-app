import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors } from '../../constants/Colors';
import { riderApi } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export const RiderDashboardScreen: React.FC = () => {
  const { fmt } = useCurrency();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await riderApi.getOrders();
      const raw: any[] = res.data.data || [];
      // deduplicate by id — FETCH JOIN can occasionally return the same order twice
      const seen = new Set<string>();
      setOrders(raw.filter(o => o?.id && !seen.has(o.id) && seen.add(o.id)));
    } catch (e: any) {
      if (!silent) Alert.alert('Error', 'Could not load deliveries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    let locationInterval: ReturnType<typeof setInterval> | null = null;

    const pushLocation = async () => {
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        await riderApi.updateLocation(loc.coords.latitude, loc.coords.longitude);
      } catch {}
    };

    const init = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        await pushLocation();
        // Push every 5s so the customer map stays live
        locationInterval = setInterval(pushLocation, 5000);
      }
      loadOrders();
    };

    init();
    const orderInterval = setInterval(() => loadOrders(true), 10000);
    return () => {
      clearInterval(orderInterval);
      if (locationInterval) clearInterval(locationInterval);
    };
  }, []));

  const handlePickup = async (orderId: string) => {
    Alert.alert('Confirm Pickup', 'Confirm that you have collected this order from the restaurant?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setUpdating(orderId);
          try {
            await riderApi.pickup(orderId);
            await loadOrders(true);
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Failed to confirm pickup');
          } finally {
            setUpdating(null);
          }
        },
      },
    ]);
  };

  const handleDeliver = async (orderId: string) => {
    Alert.alert('Mark as Delivered', 'Confirm that you have delivered this order to the customer?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delivered',
        onPress: async () => {
          setUpdating(orderId);
          try {
            await riderApi.deliver(orderId);
            await loadOrders(true);
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Failed to mark delivered');
          } finally {
            setUpdating(null);
          }
        },
      },
    ]);
  };

  const activeDeliveries = orders.filter(o => o.status === 'picked_up');
  const readyPickups = orders.filter(o => o.status === 'preparing');
  const completedDeliveries = orders.filter(o => o.status === 'delivered');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Deliveries</Text>
          <Text style={styles.headerSub}>
            {activeDeliveries.length > 0
              ? `${activeDeliveries.length} active · ${readyPickups.length} awaiting pickup`
              : readyPickups.length > 0
              ? `${readyPickups.length} orders ready for pickup`
              : 'No orders right now'}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => loadOrders()}>
          <Ionicons name="refresh" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats strip */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{activeDeliveries.length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statBox, styles.statBorder]}>
          <Text style={styles.statValue}>{readyPickups.length}</Text>
          <Text style={styles.statLabel}>Ready</Text>
        </View>
        <View style={[styles.statBox, styles.statBorder]}>
          <Text style={styles.statValue}>{completedDeliveries.length}</Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOrders(); }} colors={[Colors.primary]} />}
        >
          {/* Active delivery */}
          {activeDeliveries.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: Colors.primary }]} />
                <Text style={styles.sectionTitle}>Active Delivery</Text>
              </View>
              {activeDeliveries.map(order => (
                <View key={order.id} style={[styles.card, styles.cardActive]}>
                  <View style={styles.routeBlock}>
                    <View style={styles.routeItem}>
                      <View style={[styles.routeIcon, { backgroundColor: '#FEF3C7' }]}>
                        <Ionicons name="restaurant-outline" size={16} color={Colors.warning} />
                      </View>
                      <View style={styles.routeText}>
                        <Text style={styles.routeLabel}>PICKUP FROM</Text>
                        <Text style={styles.routeValue}>{order.restaurantName}</Text>
                      </View>
                    </View>
                    <View style={styles.routeConnector}>
                      <View style={styles.routeLine} />
                    </View>
                    <View style={styles.routeItem}>
                      <View style={[styles.routeIcon, { backgroundColor: '#DCFCE7' }]}>
                        <Ionicons name="home-outline" size={16} color={Colors.success} />
                      </View>
                      <View style={styles.routeText}>
                        <Text style={styles.routeLabel}>DELIVER TO</Text>
                        <Text style={styles.routeValue}>{order.customerName || 'Customer'}</Text>
                        <Text style={styles.routeAddress} numberOfLines={1}>{order.deliveryAddress}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="receipt-outline" size={13} color={Colors.textSecondary} />
                      <Text style={styles.metaText}>{order.orderNumber}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
                      <Text style={styles.metaText}>{timeAgo(order.createdAt)}</Text>
                    </View>
                    <Text style={styles.metaAmount}>{fmt(order.totalAmount || 0)}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: Colors.success }, updating === order.id && styles.btnDisabled]}
                    onPress={() => handleDeliver(order.id)}
                    disabled={updating === order.id}
                  >
                    {updating === order.id ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={18} color={Colors.white} style={{ marginRight: 8 }} />
                        <Text style={styles.primaryBtnText}>Mark as Delivered</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Available pickups */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: Colors.warning }]} />
              <Text style={styles.sectionTitle}>Ready for Pickup ({readyPickups.length})</Text>
            </View>
            {readyPickups.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="bicycle-outline" size={48} color={Colors.border} />
                <Text style={styles.emptyTitle}>No pickups available</Text>
                <Text style={styles.emptyText}>New orders will appear here automatically</Text>
              </View>
            )}
            {readyPickups.map(order => (
              <View key={order.id} style={styles.card}>
                {/* Restaurant + order info */}
                <View style={styles.pickupHeader}>
                  <View style={styles.pickupIconWrap}>
                    <Ionicons name="restaurant" size={20} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pickupRestaurant}>{order.restaurantName}</Text>
                    <Text style={styles.pickupMeta}>{order.orderNumber} · {timeAgo(order.createdAt)}</Text>
                  </View>
                  {order.distanceKm != null && (
                    <View style={styles.distanceBadge}>
                      <Ionicons name="location-outline" size={11} color={Colors.primary} />
                      <Text style={styles.distanceBadgeText}>{order.distanceKm} km</Text>
                    </View>
                  )}
                  <View style={styles.readyBadge}>
                    <Text style={styles.readyBadgeText}>Ready</Text>
                  </View>
                </View>

                {/* Items */}
                <View style={styles.itemsBlock}>
                  {(order.items || []).slice(0, 3).map((item: any, idx: number) => (
                    <View key={idx} style={styles.itemRow}>
                      <View style={styles.itemQtyBadge}>
                        <Text style={styles.itemQty}>{item.quantity}</Text>
                      </View>
                      <Text style={styles.itemName} numberOfLines={1}>{item.foodItemName}</Text>
                    </View>
                  ))}
                  {(order.items || []).length > 3 && (
                    <Text style={styles.moreItems}>+{order.items.length - 3} more items</Text>
                  )}
                </View>

                {/* Delivery destination */}
                <View style={styles.destRow}>
                  <Ionicons name="navigate-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.destText} numberOfLines={1}>{order.deliveryAddress}</Text>
                </View>

                <View style={styles.pickupFooter}>
                  <Text style={styles.orderTotal}>{fmt(order.totalAmount || 0)}</Text>
                  <TouchableOpacity
                    style={[styles.pickupBtn, updating === order.id && styles.btnDisabled]}
                    onPress={() => handlePickup(order.id)}
                    disabled={updating === order.id}
                  >
                    {updating === order.id ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <>
                        <Ionicons name="bag-check-outline" size={16} color={Colors.white} style={{ marginRight: 6 }} />
                        <Text style={styles.pickupBtnText}>Confirm Pickup</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Completed deliveries */}
          {completedDeliveries.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: Colors.success }]} />
                <Text style={styles.sectionTitle}>Completed ({completedDeliveries.length})</Text>
              </View>
              {completedDeliveries.map(order => (
                <View key={order.id} style={[styles.card, { opacity: 0.85 }]}>
                  <View style={styles.pickupHeader}>
                    <View style={[styles.pickupIconWrap, { backgroundColor: '#DCFCE7' }]}>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pickupRestaurant}>{order.restaurantName}</Text>
                      <Text style={styles.pickupMeta}>{order.orderNumber} · {timeAgo(order.createdAt)}</Text>
                    </View>
                    <View style={[styles.readyBadge, { backgroundColor: '#DCFCE7' }]}>
                      <Text style={[styles.readyBadgeText, { color: Colors.success }]}>Delivered</Text>
                    </View>
                  </View>
                  <View style={styles.destRow}>
                    <Ionicons name="home-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.destText} numberOfLines={1}>{order.deliveryAddress}</Text>
                    <Text style={styles.orderTotal}>{fmt(order.totalAmount || 0)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F4F6FA' },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, backgroundColor: Colors.white },
  headerTitle:      { fontSize: 20, fontWeight: '800', color: Colors.dark },
  headerSub:        { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  refreshBtn:       { width: 38, height: 38, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  statsRow:         { flexDirection: 'row', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  statBox:          { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statBorder:       { borderLeftWidth: 1, borderLeftColor: Colors.border },
  statValue:        { fontSize: 18, fontWeight: '800', color: Colors.dark },
  statLabel:        { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  center:           { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content:          { padding: 16, paddingBottom: 40 },
  section:          { marginBottom: 8 },
  sectionHeader:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionDot:       { width: 8, height: 8, borderRadius: 4 },
  sectionTitle:     { fontSize: 14, fontWeight: '700', color: Colors.dark },
  emptyState:       { alignItems: 'center', paddingVertical: 40, backgroundColor: Colors.white, borderRadius: 16, marginBottom: 12 },
  emptyTitle:       { fontSize: 16, fontWeight: '700', color: Colors.dark, marginTop: 12 },
  emptyText:        { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  card:             { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  cardActive:       { borderLeftWidth: 4, borderLeftColor: Colors.primary },
  routeBlock:       { gap: 0 },
  routeItem:        { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  routeIcon:        { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  routeText:        { flex: 1, paddingBottom: 4 },
  routeLabel:       { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5 },
  routeValue:       { fontSize: 14, fontWeight: '700', color: Colors.dark, marginTop: 1 },
  routeAddress:     { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  routeConnector:   { paddingLeft: 17, paddingVertical: 4 },
  routeLine:        { width: 2, height: 16, backgroundColor: Colors.border },
  divider:          { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  metaRow:          { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  metaItem:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:         { fontSize: 12, color: Colors.textSecondary },
  metaAmount:       { marginLeft: 'auto', fontSize: 16, fontWeight: '800', color: Colors.dark },
  primaryBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 14 },
  primaryBtnText:   { fontSize: 15, fontWeight: '700', color: Colors.white },
  btnDisabled:      { opacity: 0.5 },
  pickupHeader:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  pickupIconWrap:   { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  pickupRestaurant: { fontSize: 15, fontWeight: '700', color: Colors.dark },
  pickupMeta:       { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  distanceBadge:     { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#EEF2FF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6 },
  distanceBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  readyBadge:       { backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  readyBadgeText:   { fontSize: 12, fontWeight: '700', color: Colors.warning },
  itemsBlock:       { gap: 6, marginBottom: 10 },
  itemRow:          { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemQtyBadge:     { width: 22, height: 22, borderRadius: 6, backgroundColor: '#F4F6FA', alignItems: 'center', justifyContent: 'center' },
  itemQty:          { fontSize: 11, fontWeight: '700', color: Colors.dark },
  itemName:         { flex: 1, fontSize: 13, color: Colors.dark },
  moreItems:        { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  destRow:          { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  destText:         { flex: 1, fontSize: 13, color: Colors.textSecondary },
  pickupFooter:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderTotal:       { fontSize: 18, fontWeight: '800', color: Colors.dark },
  pickupBtn:        { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  pickupBtnText:    { fontSize: 13, fontWeight: '700', color: Colors.white },
});
