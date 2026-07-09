import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useCurrency, CURRENCIES, CurrencyCode } from '../../context/CurrencyContext';
import { profileApi } from '../../services/api';

interface Props { navigation: any; }

type MenuItem = { id: string; icon: string; label: string; color: string; screen: string | null };

const CUSTOMER_GROUPS: MenuItem[][] = [
  [
    { id: 'personal',      icon: 'person-outline',           label: 'Personal Info',   color: Colors.primary,       screen: 'EditProfile' },
    { id: 'address',       icon: 'map-outline',               label: 'Addresses',       color: '#6C6FE5',            screen: 'Addresses' },
  ],
  [
    { id: 'cart',          icon: 'bag-outline',               label: 'Cart',            color: Colors.primary,       screen: 'Cart' },
    { id: 'favourite',     icon: 'heart-outline',             label: 'Favourite',       color: '#E56C8A',            screen: null },
    { id: 'notifications', icon: 'notifications-outline',     label: 'Notifications',   color: Colors.warning,       screen: 'Notifications' },
    { id: 'cases',         icon: 'chatbox-ellipses-outline',  label: 'My Cases',        color: '#E56C8A',            screen: 'MyCases' },
    { id: 'payment',       icon: 'card-outline',              label: 'Payment Method',  color: '#6C6FE5',            screen: null },
  ],
  [
    { id: 'faq',           icon: 'help-circle-outline',       label: 'FAQs',            color: Colors.primary,       screen: null },
    { id: 'reviews',       icon: 'apps-outline',              label: 'User Reviews',    color: '#6C6FE5',            screen: 'Reviews' },
    { id: 'currency',      icon: 'cash-outline',              label: 'Currency',        color: '#10B981',            screen: null },
  ],
];

const SELLER_GROUPS: MenuItem[][] = [
  [
    { id: 'personal',      icon: 'person-outline',           label: 'Personal Info',   color: Colors.primary,       screen: 'EditProfile' },
    { id: 'address',       icon: 'map-outline',               label: 'Addresses',       color: '#6C6FE5',            screen: 'Addresses' },
  ],
  [
    { id: 'notifications', icon: 'notifications-outline',     label: 'Notifications',   color: Colors.warning,       screen: 'Notifications' },
    { id: 'currency',      icon: 'cash-outline',              label: 'Currency',        color: '#10B981',            screen: null },
  ],
];

const RIDER_GROUPS: MenuItem[][] = [
  [
    { id: 'personal',      icon: 'person-outline',           label: 'Personal Info',   color: Colors.primary,       screen: 'EditProfile' },
    { id: 'address',       icon: 'map-outline',               label: 'Addresses',       color: '#6C6FE5',            screen: 'Addresses' },
  ],
  [
    { id: 'notifications', icon: 'notifications-outline',     label: 'Notifications',   color: Colors.warning,       screen: 'Notifications' },
    { id: 'currency',      icon: 'cash-outline',              label: 'Currency',        color: '#10B981',            screen: null },
  ],
];

const ADMIN_GROUPS: MenuItem[][] = [
  [
    { id: 'personal',      icon: 'person-outline',           label: 'Personal Info',   color: Colors.primary,       screen: 'EditProfile' },
  ],
  [
    { id: 'users',         icon: 'people-outline',           label: 'Manage Users',    color: '#6C6FE5',            screen: 'AdminUsers' },
    { id: 'onboard',       icon: 'person-add-outline',       label: 'Onboard User',    color: Colors.success,       screen: 'OnboardUser' },
    { id: 'notifications', icon: 'notifications-outline',    label: 'Notifications',   color: Colors.warning,       screen: 'Notifications' },
  ],
];

const ROLE_GROUPS: Record<string, MenuItem[][]> = {
  admin:    ADMIN_GROUPS,
  seller:   SELLER_GROUPS,
  rider:    RIDER_GROUPS,
  customer: CUSTOMER_GROUPS,
};

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  admin:    { label: 'Platform Admin',   color: '#F59E0B', bg: '#FEF3C7' },
  seller:   { label: 'Restaurant Owner', color: '#6C6FE5', bg: '#EDEDFF' },
  rider:    { label: 'Delivery Rider',   color: Colors.success, bg: '#DCFCE7' },
  customer: { label: 'Customer',         color: Colors.primary, bg: Colors.primaryLight },
};

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout, updateUser } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const role = user?.role || 'customer';

  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        try {
          const res = await profileApi.get();
          updateUser({ ...user!, ...res.data.data, role: res.data.data.role as any });
        } catch (e) {}
      };
      refresh();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const groups = ROLE_GROUPS[role] ?? CUSTOMER_GROUPS;
  const roleMeta = ROLE_META[role] || ROLE_META.customer;
  const canGoBack = navigation.canGoBack();

  const renderItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => {
        if (item.id === 'currency') { setShowCurrencyModal(true); return; }
        if (item.screen) navigation.navigate(item.screen);
      }}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
        <Ionicons name={item.icon as any} size={18} color={item.color} />
      </View>
      <Text style={styles.menuLabel}>{item.label}</Text>
      {item.id === 'currency'
        ? <Text style={styles.currencyChip}>{currency}</Text>
        : <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {canGoBack ? (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <View style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></View>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={22} color={Colors.dark} />
          </TouchableOpacity>
        </View>

        {/* Avatar, name, role badge */}
        <View style={styles.profileTop}>
          <View style={styles.avatar}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <Ionicons name="person" size={38} color={Colors.primary} />
            )}
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          {user?.bio ? <Text style={styles.userBio}>{user.bio}</Text> : null}
          <View style={[styles.roleBadge, { backgroundColor: roleMeta.bg }]}>
            <Text style={[styles.roleLabel, { color: roleMeta.color }]}>{roleMeta.label}</Text>
          </View>
        </View>

        {groups.map((group, gi) => (
          <View key={gi} style={styles.menuGroup}>
            {group.map(renderItem)}
          </View>
        ))}

        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={[styles.menuIcon, { backgroundColor: `${Colors.error}20` }]}>
              <Ionicons name="log-out-outline" size={18} color={Colors.error} />
            </View>
            <Text style={[styles.menuLabel, { color: Colors.error }]}>Log Out</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Currency picker modal */}
      <Modal visible={showCurrencyModal} transparent animationType="slide" onRequestClose={() => setShowCurrencyModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCurrencyModal(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Currency</Text>
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map(code => (
              <TouchableOpacity
                key={code}
                style={[styles.currencyRow, currency === code && styles.currencyRowActive]}
                onPress={() => { setCurrency(code); setShowCurrencyModal(false); }}
              >
                <View style={styles.currencyRowLeft}>
                  <Text style={styles.currencyCode}>{code}</Text>
                  <Text style={styles.currencyLabel}>{CURRENCIES[code].label}</Text>
                </View>
                {currency === code && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.background },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.white },
  backBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.inputBg, alignItems: 'center', justifyContent: 'center' },
  backArrow:   { fontSize: 24, color: Colors.dark, lineHeight: 28 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  profileTop:  { alignItems: 'center', paddingVertical: 24, backgroundColor: Colors.white, marginBottom: 12 },
  avatar:      { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  userName:    { fontSize: 20, fontWeight: '700', color: Colors.dark, marginBottom: 4 },
  userBio:     { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  roleBadge:   { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginTop: 4 },
  roleLabel:   { fontSize: 12, fontWeight: '700' },
  menuGroup:   { backgroundColor: Colors.white, borderRadius: 16, marginHorizontal: 16, marginBottom: 12, overflow: 'hidden' },
  menuItem:    { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon:         { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  menuLabel:        { flex: 1, fontSize: 14, color: Colors.dark },
  currencyChip:     { fontSize: 12, fontWeight: '700', color: '#10B981', backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  modalOverlay:     { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet:       { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle:      { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 20 },
  modalTitle:       { fontSize: 17, fontWeight: '700', color: Colors.dark, marginBottom: 16 },
  currencyRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: Colors.border },
  currencyRowActive:{ backgroundColor: Colors.primaryLight, marginHorizontal: -4, paddingHorizontal: 8, borderRadius: 12, borderBottomWidth: 0 },
  currencyRowLeft:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  currencyCode:     { fontSize: 15, fontWeight: '800', color: Colors.dark, width: 40 },
  currencyLabel:    { fontSize: 14, color: Colors.textSecondary },
});
