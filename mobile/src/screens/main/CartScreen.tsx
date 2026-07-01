import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ListRenderItem,
  Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CartItem } from '../../types';
import { addressApi } from '../../services/api';

interface Props { navigation: any; }

export const CartScreen: React.FC<Props> = ({ navigation }) => {
  const { items, totalPrice, deliveryAddress, setDeliveryAddress, updateQuantity, removeItem } = useCart();
  const { fmt } = useCurrency();
  const [editing, setEditing] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const openAddressModal = async () => {
    setCustomAddress(deliveryAddress);
    setAddressModalVisible(true);
    setLoadingAddresses(true);
    try {
      const res = await addressApi.getAll();
      setSavedAddresses(res.data.data || []);
    } catch {
      setSavedAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const confirmAddress = (addr: string) => {
    if (addr.trim()) {
      setDeliveryAddress(addr.trim());
    }
    setAddressModalVisible(false);
  };

  const renderItem: ListRenderItem<CartItem> = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemThumb} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.foodItem.name}</Text>
        <Text style={styles.itemPrice}>{fmt(item.foodItem.price * item.quantity)}</Text>
        <View style={styles.itemMeta}>
          <Text style={styles.itemSize}>{item.size}</Text>
          <View style={styles.qtyRow}>
            {editing ? (
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.foodItem.id)}>
                <Ionicons name="close" size={14} color={Colors.white} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.qBtn} onPress={() => updateQuantity(item.foodItem.id, item.quantity - 1)}>
              <Ionicons name="remove" size={16} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.qty}>{item.quantity}</Text>
            <TouchableOpacity style={styles.qBtn} onPress={() => updateQuantity(item.foodItem.id, item.quantity + 1)}>
              <Ionicons name="add" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Text style={styles.editText}>{editing ? 'DONE' : 'EDIT ITEMS'}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, i) => `${item.foodItem.id}-${i}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Address picker modal */}
      <Modal visible={addressModalVisible} animationType="slide" transparent onRequestClose={() => setAddressModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delivery Address</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.dark} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.addressInput}
              value={customAddress}
              onChangeText={setCustomAddress}
              placeholder="Type your address…"
              placeholderTextColor={Colors.textMuted}
              multiline
            />

            {loadingAddresses ? (
              <ActivityIndicator color={Colors.primary} style={{ marginVertical: 16 }} />
            ) : savedAddresses.length > 0 ? (
              <>
                <Text style={styles.savedLabel}>SAVED ADDRESSES</Text>
                {savedAddresses.map((a: any) => (
                  <TouchableOpacity key={a.id} style={styles.savedItem} onPress={() => confirmAddress(a.fullAddress)}>
                    <Ionicons name="location-outline" size={18} color={Colors.primary} style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.savedItemLabel}>{a.label}</Text>
                      <Text style={styles.savedItemAddr} numberOfLines={1}>{a.fullAddress}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </>
            ) : null}

            <TouchableOpacity style={styles.confirmBtn} onPress={() => confirmAddress(customAddress)}>
              <Text style={styles.confirmBtnText}>CONFIRM ADDRESS</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Bottom sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.addressRow}>
          <Text style={styles.addressLabel}>DELIVERY ADDRESS</Text>
          <TouchableOpacity onPress={openAddressModal}><Text style={styles.editText}>EDIT</Text></TouchableOpacity>
        </View>
        <View style={styles.addressBox}>
          <Text style={styles.addressText}>{deliveryAddress}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL:</Text>
          <Text style={styles.totalAmount}>{fmt(totalPrice)}</Text>
          <TouchableOpacity style={styles.breakdownBtn}>
            <Text style={styles.breakdownText}>Breakdown</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.orderBtn, items.length === 0 && styles.orderBtnDisabled]}
          onPress={() => items.length > 0 && navigation.navigate('Payment')}
          disabled={items.length === 0}
        >
          <Text style={styles.orderBtnText}>PLACE ORDER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, color: Colors.white, lineHeight: 28 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  editText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: Colors.textMuted },
  list: { paddingHorizontal: 20, paddingTop: 8, gap: 16 },
  cartItem: { flexDirection: 'row', gap: 12 },
  itemThumb: { width: 80, height: 80, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  itemPrice: { fontSize: 18, fontWeight: '700', color: Colors.white, marginBottom: 8 },
  itemMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemSize: { fontSize: 13, color: Colors.textMuted },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.darkBlue, borderRadius: 24, paddingHorizontal: 10, paddingVertical: 6 },
  qBtn: { alignItems: 'center', justifyContent: 'center' },
  qty: { fontSize: 14, fontWeight: '700', color: Colors.white, minWidth: 16, textAlign: 'center' },
  removeBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center' },
  bottomSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  addressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  addressLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.8 },
  addressBox: { backgroundColor: Colors.inputBg, borderRadius: 12, padding: 14, marginBottom: 16 },
  addressText: { fontSize: 14, color: Colors.dark },
  totalRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  totalLabel: { fontSize: 14, color: Colors.textSecondary },
  totalAmount: { fontSize: 22, fontWeight: '700', color: Colors.dark, flex: 1 },
  breakdownBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  breakdownText: { fontSize: 13, color: Colors.primary },
  orderBtn: { backgroundColor: Colors.primary, borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center' },
  orderBtnDisabled: { opacity: 0.5 },
  orderBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white, letterSpacing: 1.2 },

  // Address modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: Colors.dark },
  addressInput: { backgroundColor: Colors.inputBg, borderRadius: 12, padding: 14, fontSize: 14, color: Colors.dark, marginBottom: 16, minHeight: 56 },
  savedLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.8, marginBottom: 10 },
  savedItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.inputBg, borderRadius: 12, padding: 12, marginBottom: 10 },
  savedItemLabel: { fontSize: 12, fontWeight: '700', color: Colors.dark, marginBottom: 2 },
  savedItemAddr: { fontSize: 12, color: Colors.textSecondary },
  confirmBtn: { backgroundColor: Colors.primary, borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  confirmBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white, letterSpacing: 1.2 },
});
