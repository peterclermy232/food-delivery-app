import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { sellerApi } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';

const NEXT_ACTION: Record<string, { status: string; label: string }> = {
  pending:   { status: 'confirmed', label: 'Accept' },
  confirmed: { status: 'preparing', label: 'Prepare' },
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'New', confirmed: 'Accepted', preparing: 'Preparing',
  picked_up: 'Dispatched', delivered: 'Delivered', cancelled: 'Cancelled',
};

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export const SellerDashboardScreen: React.FC = () => {
  const { fmt } = useCurrency();
  const [orders, setOrders] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [ordersRes, restRes] = await Promise.all([
        sellerApi.getOrders(),
        sellerApi.getRestaurants(),
      ]);
      setOrders(ordersRes.data.data || []);
      setRestaurants(restRes.data.data || []);
    } catch {
      if (!silent) Alert.alert('Error', 'Could not load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    loadData();
    const iv = setInterval(() => loadData(true), 15000);
    return () => clearInterval(iv);
  }, []));

  const filteredOrders = useMemo(() =>
    selectedRestaurantId
      ? orders.filter(o => o.restaurantId === selectedRestaurantId)
      : orders,
    [orders, selectedRestaurantId]
  );

  const selectedRestaurant = restaurants.find(r => r.id === selectedRestaurantId);
  const displayName = selectedRestaurant?.name || (restaurants.length === 1 ? restaurants[0]?.name : 'All Restaurants');

  const handleAction = async (orderId: string, nextStatus: string) => {
    setUpdating(orderId);
    try {
      await sellerApi.updateOrderStatus(orderId, nextStatus);
      await loadData(true);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdating(null);
    }
  };

  const handleCancel = (orderId: string) => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Cancel Order', style: 'destructive',
        onPress: async () => {
          setUpdating(orderId);
          try {
            await sellerApi.updateOrderStatus(orderId, 'cancelled');
            await loadData(true);
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Failed to cancel');
          } finally {
            setUpdating(null);
          }
        },
      },
    ]);
  };

  const runningOrders  = filteredOrders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status));
  const completedToday = filteredOrders.filter(o => o.status === 'delivered').length;
  const revenue        = filteredOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Dark header banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTop}>
          <View style={styles.storeRow}>
            <View style={styles.storeIcon}>
              <Ionicons name="storefront" size={18} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.storeLabel}>RESTAURANT</Text>
              <Text style={styles.storeName}>{displayName}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => loadData()} style={styles.refreshCircle}>
            <Ionicons name="refresh" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Restaurant filter pills — only shown when seller has >1 restaurant */}
        {restaurants.length > 1 && (
          <FlatList
            horizontal
            data={[{ id: null, name: 'All' }, ...restaurants]}
            keyExtractor={item => item.id ?? '__all__'}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsRow}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.pill, selectedRestaurantId === item.id && styles.pillActive]}
                onPress={() => setSelectedRestaurantId(item.id)}
              >
                <Text style={[styles.pillText, selectedRestaurantId === item.id && styles.pillTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{runningOrders.length}</Text>
            <Text style={styles.statLabel}>Running{'\n'}Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedToday}</Text>
            <Text style={styles.statLabel}>Completed{'\n'}Today</Text>
          </View>
          <View style={[styles.statCard, styles.revenueCard]}>
            <Text style={styles.revenueAmount}>{fmt(revenue)}</Text>
            <Text style={styles.statLabel}>Total{'\n'}Revenue</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={[Colors.primary]} />}
        >
          {/* Running orders section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{runningOrders.length} Running Orders</Text>
          </View>

          {runningOrders.length === 0 && (
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={44} color={Colors.border} />
              <Text style={styles.emptyTitle}>No active orders</Text>
              <Text style={styles.emptyText}>New orders will appear here</Text>
            </View>
          )}

          {runningOrders.map(order => {
            const action = NEXT_ACTION[order.status];
            const busy = updating === order.id;
            return (
              <View key={order.id} style={styles.orderCard}>
                {/* Order meta row */}
                <View style={styles.orderMeta}>
                  <View>
                    <Text style={styles.orderNum}>{order.orderNumber}</Text>
                    <Text style={styles.orderTime}>{timeAgo(order.createdAt)}</Text>
                  </View>
                  <View style={[styles.statusPill,
                    order.status === 'pending'   && styles.pillPending,
                    order.status === 'confirmed' && styles.pillConfirmed,
                    order.status === 'preparing' && styles.pillPreparing,
                  ]}>
                    <Text style={[styles.statusPillText,
                      order.status === 'pending'   && { color: Colors.warning },
                      order.status === 'confirmed' && { color: Colors.primary },
                      order.status === 'preparing' && { color: '#6C6FE5' },
                    ]}>{STATUS_LABELS[order.status]}</Text>
                  </View>
                </View>

                {/* Customer */}
                <View style={styles.customerRow}>
                  <Ionicons name="person-circle-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.customerName}>{order.customerName || 'Customer'}</Text>
                </View>

                {/* Item list */}
                <View style={styles.itemList}>
                  {(order.items || []).map((item: any, i: number) => (
                    <View key={i} style={styles.itemRow}>
                      <View style={styles.itemThumb} />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={1}>{item.foodItemName}</Text>
                        <Text style={styles.itemMeta}>{item.size} · ×{item.quantity}</Text>
                      </View>
                      <Text style={styles.itemPrice}>{fmt(item.subtotal || 0)}</Text>
                    </View>
                  ))}
                </View>

                {/* Total + actions */}
                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>
                    Total: <Text style={styles.orderTotalBold}>{fmt(order.totalAmount || 0)}</Text>
                  </Text>
                  <View style={styles.actionRow}>
                    {order.status !== 'preparing' && (
                      <TouchableOpacity
                        style={[styles.cancelBtn, busy && styles.btnDisabled]}
                        onPress={() => handleCancel(order.id)}
                        disabled={busy}
                      >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                    )}
                    {action && (
                      <TouchableOpacity
                        style={[styles.acceptBtn, busy && styles.btnDisabled]}
                        onPress={() => handleAction(order.id, action.status)}
                        disabled={busy}
                      >
                        {busy
                          ? <ActivityIndicator size="small" color={Colors.white} />
                          : <Text style={styles.acceptBtnText}>{action.label}</Text>
                        }
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}

          {/* Past orders */}
          {filteredOrders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length > 0 && (
            <>
              <View style={[styles.sectionHeader, { marginTop: 8 }]}>
                <Text style={styles.sectionTitle}>Past Orders</Text>
              </View>
              {filteredOrders.filter(o => ['delivered', 'cancelled'].includes(o.status)).map(order => (
                <View key={order.id} style={[styles.orderCard, styles.orderCardMuted]}>
                  <View style={styles.orderMeta}>
                    <View>
                      <Text style={styles.orderNum}>{order.orderNumber}</Text>
                      <Text style={styles.orderTime}>{timeAgo(order.createdAt)}</Text>
                    </View>
                    <View style={[styles.statusPill,
                      order.status === 'delivered' ? styles.pillDelivered : styles.pillCancelled,
                    ]}>
                      <Text style={[styles.statusPillText,
                        order.status === 'delivered' ? { color: Colors.success } : { color: Colors.error },
                      ]}>{STATUS_LABELS[order.status]}</Text>
                    </View>
                  </View>
                  <Text style={styles.orderTotalBold}>{fmt(order.totalAmount || 0)}</Text>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F5F5F5' },

  // Banner
  banner:          { backgroundColor: Colors.dark, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  bannerTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  storeRow:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  storeIcon:       { width: 40, height: 40, borderRadius: 12, backgroundColor: '#2D2D44', alignItems: 'center', justifyContent: 'center' },
  storeLabel:      { fontSize: 10, color: Colors.primary, fontWeight: '700', letterSpacing: 1 },
  storeName:       { fontSize: 15, fontWeight: '700', color: Colors.white, marginTop: 1 },
  refreshCircle:   { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2D2D44', alignItems: 'center', justifyContent: 'center' },

  pillsRow:        { paddingBottom: 16, gap: 8, paddingHorizontal: 0 },
  pill:            { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  pillActive:      { borderColor: Colors.primary, backgroundColor: Colors.primary },
  pillText:        { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },
  pillTextActive:  { color: Colors.white },

  statsRow:        { flexDirection: 'row', gap: 12 },
  statCard:        { flex: 1, backgroundColor: '#2D2D44', borderRadius: 16, padding: 14 },
  revenueCard:     { flex: 1.4 },
  statNumber:      { fontSize: 28, fontWeight: '800', color: Colors.white },
  revenueAmount:   { fontSize: 22, fontWeight: '800', color: Colors.primary },
  statLabel:       { fontSize: 11, color: '#9999AA', marginTop: 4, lineHeight: 15 },

  // Content
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content:         { padding: 16, paddingBottom: 40 },
  sectionHeader:   { marginBottom: 12 },
  sectionTitle:    { fontSize: 16, fontWeight: '800', color: Colors.dark },

  emptyCard:       { backgroundColor: Colors.white, borderRadius: 16, alignItems: 'center', paddingVertical: 40, marginBottom: 12 },
  emptyTitle:      { fontSize: 15, fontWeight: '700', color: Colors.dark, marginTop: 12 },
  emptyText:       { fontSize: 13, color: '#999', marginTop: 4 },

  // Order card
  orderCard:       { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  orderCardMuted:  { opacity: 0.75 },
  orderMeta:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  orderNum:        { fontSize: 14, fontWeight: '700', color: Colors.dark },
  orderTime:       { fontSize: 11, color: '#999', marginTop: 2 },
  statusPill:      { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  pillPending:     { backgroundColor: '#FFF8E6' },
  pillConfirmed:   { backgroundColor: '#FFF0EB' },
  pillPreparing:   { backgroundColor: '#EDECFF' },
  pillDelivered:   { backgroundColor: '#EDFAF1' },
  pillCancelled:   { backgroundColor: '#FFEBEB' },
  statusPillText:  { fontSize: 12, fontWeight: '700' },

  customerRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  customerName:    { fontSize: 13, color: '#666' },

  itemList:        { gap: 10, marginBottom: 14, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
  itemRow:         { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemThumb:       { width: 44, height: 44, borderRadius: 10, backgroundColor: '#F0F0F0' },
  itemInfo:        { flex: 1 },
  itemName:        { fontSize: 13, fontWeight: '600', color: Colors.dark },
  itemMeta:        { fontSize: 11, color: '#999', marginTop: 2 },
  itemPrice:       { fontSize: 14, fontWeight: '700', color: Colors.dark },

  orderFooter:     { borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderTotal:      { fontSize: 13, color: '#666' },
  orderTotalBold:  { fontSize: 15, fontWeight: '800', color: Colors.dark },
  actionRow:       { flexDirection: 'row', gap: 8 },
  cancelBtn:       { borderWidth: 1.5, borderColor: '#DDD', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 9 },
  cancelBtnText:   { fontSize: 13, fontWeight: '700', color: '#666' },
  acceptBtn:       { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 22, paddingVertical: 9 },
  acceptBtnText:   { fontSize: 13, fontWeight: '700', color: Colors.white },
  btnDisabled:     { opacity: 0.5 },
});
