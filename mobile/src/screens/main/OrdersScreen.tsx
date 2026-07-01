import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { orderApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { FoodItem } from '../../types';

interface Props { navigation: any; }

export const OrdersScreen: React.FC<Props> = ({ navigation }) => {
  const { items: cartItems, addItem, clearCart } = useCart();
  const { fmt } = useCurrency();
  const [activeTab, setActiveTab] = useState<'Ongoing' | 'History'>('Ongoing');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        try {
          const res = await orderApi.getAll();
          setOrders(res.data.data || []);
        } catch (e) {
          console.error('Failed to load orders', e);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [])
  );

  const ongoing = orders.filter(o =>
    ['pending', 'confirmed', 'preparing', 'picked_up'].includes(o.status)
  );
  const history = orders.filter(o =>
    ['delivered', 'cancelled', 'completed'].includes(o.status)
  );

  const statusColor = (status: string) => {
    if (status === 'delivered' || status === 'completed') return Colors.success;
    if (status === 'cancelled') return Colors.error;
    return Colors.textSecondary;
  };

  const statusLabel = (status: string) => {
    if (status === 'delivered' || status === 'completed') return 'Completed';
    if (status === 'cancelled') return 'Canceled';
    return 'Ongoing';
  };

  const handleCancel = (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Cancel Order', style: 'destructive',
          onPress: async () => {
            try {
              await orderApi.cancel(orderId);
              const res = await orderApi.getAll();
              setOrders(res.data.data || []);
            } catch {
              Alert.alert('Error', 'Could not cancel the order. Please try again.');
            }
          },
        },
      ]
    );
  };

  const doReorder = (order: any) => {
    clearCart();
    for (const item of (order.items || [])) {
      const foodItem: FoodItem = {
        id: item.foodItemId,
        name: item.foodItemName,
        price: item.unitPrice,
        restaurantId: order.restaurantId || '',
        restaurantName: order.restaurantName || '',
        category: '',
        rating: 0,
        ingredients: [],
        sizes: item.size ? [item.size] : ['Regular'],
        availableForDelivery: true,
        availableForPickup: true,
      };
      addItem(foodItem, item.quantity, item.size || 'Regular');
    }
    navigation.navigate('Cart');
  };

  const handleReorder = (order: any) => {
    if (cartItems.length > 0) {
      Alert.alert(
        'Replace Cart?',
        'Your current cart will be cleared and replaced with items from this order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reorder', onPress: () => doReorder(order) },
        ]
      );
    } else {
      doReorder(order);
    }
  };

  const displayOrders = activeTab === 'Ongoing' ? ongoing : history;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['Ongoing', 'History'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {displayOrders.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No orders</Text>
            </View>
          )}
          {displayOrders.map((order) => (
            <View key={order.id}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryType}>Food</Text>
                {activeTab === 'History' && (
                  <Text style={[styles.statusBadge, { color: statusColor(order.status) }]}>
                    {statusLabel(order.status)}
                  </Text>
                )}
              </View>
              <View style={styles.orderCard}>
                <View style={styles.orderThumb} />
                <View style={styles.orderInfo}>
                  <View style={styles.orderHeaderRow}>
                    <Text style={styles.restaurantName}>{order.restaurantName}</Text>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                  </View>
                  <Text style={styles.orderPrice}>{fmt(order.totalAmount ?? 0)}</Text>
                  <Text style={styles.orderMeta}>
                    {activeTab === 'History'
                      ? new Date(order.createdAt).toLocaleDateString() + ' • '
                      : ''}
                    {order.items?.length ?? 0} Items
                  </Text>
                </View>
              </View>
              <View style={styles.actionRow}>
                {activeTab === 'Ongoing' ? (
                  <>
                    <TouchableOpacity
                      style={styles.trackBtn}
                      onPress={() => navigation.navigate('TrackOrder', { orderId: order.id })}
                    >
                      <Text style={styles.trackBtnText}>Track Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => handleCancel(order.id)}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {order.status === 'delivered' && !order.ratingValue && (
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => navigation.navigate('TrackOrder', { orderId: order.id })}
                      >
                        <Text style={styles.cancelBtnText}>Rate</Text>
                      </TouchableOpacity>
                    )}
                    {order.status === 'delivered' && order.ratingValue && (
                      <View style={[styles.cancelBtn, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ color: '#FBBF24', fontSize: 16 }}>
                          {'★'.repeat(order.ratingValue)}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.trackBtn}
                      onPress={() => handleReorder(order)}
                    >
                      <Text style={styles.trackBtnText}>Re-Order</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
              <View style={styles.separator} />
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.inputBg, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, color: Colors.dark, lineHeight: 28 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: 14, color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: '600' },
  content: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: Colors.textMuted },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  categoryType: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  statusBadge: { fontSize: 13, fontWeight: '600' },
  orderCard: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, alignItems: 'center' },
  orderThumb: { width: 60, height: 60, borderRadius: 10, backgroundColor: Colors.inputBg },
  orderInfo: { flex: 1 },
  orderHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  restaurantName: { fontSize: 15, fontWeight: '700', color: Colors.dark },
  orderNumber: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  orderPrice: { fontSize: 16, fontWeight: '700', color: Colors.dark, marginTop: 2 },
  orderMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 12 },
  trackBtn: { flex: 1, height: 44, backgroundColor: Colors.primary, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  trackBtnText: { fontSize: 13, fontWeight: '600', color: Colors.white },
  cancelBtn: { flex: 1, height: 44, borderWidth: 1, borderColor: Colors.primary, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  separator: { height: 1, backgroundColor: Colors.border, marginHorizontal: 20, marginTop: 16 },
});
