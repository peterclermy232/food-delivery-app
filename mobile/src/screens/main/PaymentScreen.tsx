import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { orderApi, paymentApi } from '../../services/api';

interface Props { navigation: any; }

const paymentMethods = [
  { id: 'cash', label: 'Cash', icon: 'cash' },
  { id: 'visa', label: 'Visa', icon: 'visa' },
  { id: 'mastercard', label: 'Mastercard', icon: 'mastercard' },
  { id: 'paypal', label: 'PayPal', icon: 'paypal' },
];

export const PaymentScreen: React.FC<Props> = ({ navigation }) => {
  const { totalPrice, clearCart, items, deliveryAddress } = useCart();
  const { fmt } = useCurrency();
  const [selectedMethod, setSelectedMethod] = useState('mastercard');
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    paymentApi.getCards().then(r => setCards(r.data.data || [])).catch(() => {});
  }, []);

  const handlePay = async () => {
    if (items.length === 0) return;
    if (!deliveryAddress) {
      Alert.alert('No delivery address', 'Please set a delivery address before placing your order.');
      return;
    }
    setLoading(true);
    try {
      const restaurantId = items[0]?.foodItem.restaurantId;
      const res = await orderApi.place({
        items: items.map(i => ({
          foodItemId: i.foodItem.id,
          quantity: i.quantity,
          size: i.size,
        })),
        restaurantId,
        deliveryAddress,
        paymentMethod: selectedMethod,
      });
      const orderId = res.data.data?.id;
      clearCart();
      navigation.replace('OrderSuccess', { orderId });
    } catch (err: any) {
      Alert.alert('Payment failed', err?.response?.data?.message || 'Could not place order. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content}>
        {/* Payment method tabs */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={paymentMethods}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.methodList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.methodCard, selectedMethod === item.id && styles.methodCardActive]}
              onPress={() => setSelectedMethod(item.id)}
            >
              {selectedMethod === item.id && (
                <View style={styles.methodCheck}>
                  <Ionicons name="checkmark" size={12} color={Colors.white} />
                </View>
              )}
              <View style={styles.methodIcon}>
                <Text style={styles.methodEmoji}>
                  {item.id === 'cash' ? '💵' : item.id === 'visa' ? '💳' : item.id === 'mastercard' ? '🔴' : '🅿️'}
                </Text>
                {item.id === 'visa' && <Text style={styles.visaText}>VISA</Text>}
              </View>
              <Text style={styles.methodLabel}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Card display */}
        {selectedMethod === 'mastercard' && (
          <View style={styles.cardSection}>
            {cards.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.cardIllustration} />
                <Text style={styles.noCardTitle}>No master card added</Text>
                <Text style={styles.noCardSubtitle}>You can add a mastercard and save it for later</Text>
              </View>
            ) : (
              <View style={styles.cardSelector}>
                <Text style={styles.cardBrand}>Master Card</Text>
                <View style={styles.cardRow}>
                  <Text style={styles.cardNumber}>•••••••••••••• {cards[0].lastFour}</Text>
                  <Ionicons name="chevron-down" size={16} color={Colors.dark} />
                </View>
              </View>
            )}
            <TouchableOpacity
              style={styles.addNewCard}
              onPress={() => navigation.navigate('AddCard')}
            >
              <Ionicons name="add" size={18} color={Colors.primary} />
              <Text style={styles.addNewCardText}>ADD NEW</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL:</Text>
          <Text style={styles.totalAmount}>{fmt(totalPrice)}</Text>
        </View>
        <TouchableOpacity style={[styles.payBtn, loading && styles.payBtnDisabled]} onPress={handlePay} disabled={loading}>
          {loading
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={styles.payBtnText}>PAY & CONFIRM</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.inputBg, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, color: Colors.dark, lineHeight: 28 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  content: { flex: 1 },
  methodList: { paddingHorizontal: 20, gap: 10, paddingBottom: 20 },
  methodCard: {
    width: 84, padding: 12, borderRadius: 12, borderWidth: 1.5,
    borderColor: Colors.border, alignItems: 'center', gap: 6,
  },
  methodCardActive: { borderColor: Colors.primary },
  methodCheck: {
    position: 'absolute', top: -8, right: -8, width: 22, height: 22,
    borderRadius: 11, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  methodIcon: { height: 32, alignItems: 'center', justifyContent: 'center' },
  methodEmoji: { fontSize: 22 },
  visaText: { fontSize: 16, fontWeight: '900', color: '#1a1f71' },
  methodLabel: { fontSize: 11, color: Colors.dark, fontWeight: '500' },
  cardSection: { paddingHorizontal: 20 },
  emptyCard: {
    backgroundColor: Colors.inputBg, borderRadius: 16, padding: 32,
    alignItems: 'center', marginBottom: 16,
  },
  cardIllustration: { width: 120, height: 76, borderRadius: 12, backgroundColor: Colors.primary, marginBottom: 16, opacity: 0.7 },
  noCardTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark, marginBottom: 6 },
  noCardSubtitle: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
  cardSelector: { backgroundColor: Colors.inputBg, borderRadius: 12, padding: 16, marginBottom: 12 },
  cardBrand: { fontSize: 13, fontWeight: '600', color: Colors.dark, marginBottom: 8 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardNumber: { flex: 1, fontSize: 14, color: Colors.dark, fontFamily: 'monospace' },
  addNewCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 12, height: 52,
  },
  addNewCardText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  footer: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  totalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  totalLabel: { fontSize: 14, color: Colors.textSecondary },
  totalAmount: { fontSize: 24, fontWeight: '700', color: Colors.dark },
  payBtn: { backgroundColor: Colors.primary, borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center' },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white, letterSpacing: 1.2 },
});
