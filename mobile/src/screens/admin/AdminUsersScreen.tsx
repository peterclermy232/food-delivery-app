import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { adminApi } from '../../services/api';

interface Props { navigation: any; route: any; }

const ROLE_TABS = ['all', 'seller', 'rider', 'customer'] as const;
type RoleTab = typeof ROLE_TABS[number];

const ROLE_COLOR: Record<string, { text: string; bg: string }> = {
  seller:   { text: '#6C6FE5', bg: '#EDEDFF' },
  rider:    { text: Colors.success, bg: '#DCFCE7' },
  customer: { text: Colors.primary, bg: Colors.primaryLight },
  admin:    { text: '#F59E0B', bg: '#FEF3C7' },
};

export const AdminUsersScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialRole: RoleTab = route?.params?.filterRole || 'all';
  const [activeTab, setActiveTab] = useState<RoleTab>(initialRole);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const role = activeTab === 'all' ? undefined : activeTab;
      const res = await adminApi.getUsers(role);
      setUsers(res.data.data || []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, [activeTab]));

  const handleToggle = (user: any) => {
    const action = user.enabled ? 'disable' : 'enable';
    Alert.alert(
      `${action === 'disable' ? 'Disable' : 'Enable'} Account`,
      `Are you sure you want to ${action} ${user.name}'s account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'disable' ? 'Disable' : 'Enable',
          style: action === 'disable' ? 'destructive' : 'default',
          onPress: async () => {
            setToggling(user.id);
            try {
              if (user.enabled) {
                await adminApi.disableUser(user.id);
              } else {
                await adminApi.enableUser(user.id);
              }
              setUsers(prev => prev.map(u =>
                u.id === user.id ? { ...u, enabled: !u.enabled } : u
              ));
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to update account.');
            } finally {
              setToggling(null);
            }
          },
        },
      ]
    );
  };

  const renderItem: ListRenderItem<any> = ({ item }) => {
    const roleStyle = ROLE_COLOR[item.role] || ROLE_COLOR.customer;
    return (
      <View style={[styles.card, !item.enabled && styles.cardDisabled]}>
        <View style={styles.cardLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {item.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.userName, !item.enabled && styles.textMuted]}>{item.name}</Text>
              <View style={[styles.roleBadge, { backgroundColor: roleStyle.bg }]}>
                <Text style={[styles.roleText, { color: roleStyle.text }]}>
                  {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
            {item.phone ? <Text style={styles.userPhone}>{item.phone}</Text> : null}
            <Text style={[styles.status, { color: item.enabled ? Colors.success : Colors.error }]}>
              {item.enabled ? 'Active' : 'Disabled'}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editIconBtn}
            onPress={() => navigation.navigate('OnboardUser', { user: item })}
          >
            <Ionicons name="create-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, { backgroundColor: item.enabled ? '#FEE2E2' : '#DCFCE7' }]}
            onPress={() => handleToggle(item)}
            disabled={toggling === item.id}
          >
            {toggling === item.id
              ? <ActivityIndicator size="small" color={item.enabled ? Colors.error : Colors.success} />
              : <Ionicons
                  name={item.enabled ? 'ban-outline' : 'checkmark-circle-outline'}
                  size={18}
                  color={item.enabled ? Colors.error : Colors.success}
                />
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Users</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('OnboardUser')}
        >
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Role filter tabs */}
      <View style={styles.tabs}>
        {ROLE_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={users}
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
              <Ionicons name="people-outline" size={52} color={Colors.border} />
              <Text style={styles.emptyTitle}>No {activeTab === 'all' ? 'users' : activeTab + 's'} yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F4F6FA' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.inputBg, alignItems: 'center', justifyContent: 'center' },
  backArrow:    { fontSize: 24, color: Colors.dark, lineHeight: 28 },
  headerTitle:  { fontSize: 17, fontWeight: '700', color: Colors.dark },
  addBtn:       { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  tabs:         { flexDirection: 'row', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab:          { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive:    { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText:      { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive:{ color: Colors.primary },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  list:         { padding: 16, paddingBottom: 48, gap: 10 },
  card:         { backgroundColor: Colors.white, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardDisabled: { opacity: 0.65 },
  cardLeft:     { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar:       { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarInitial:{ fontSize: 18, fontWeight: '700', color: Colors.white },
  cardInfo:     { flex: 1 },
  nameRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  userName:     { fontSize: 14, fontWeight: '700', color: Colors.dark },
  textMuted:    { color: Colors.textMuted },
  roleBadge:    { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  roleText:     { fontSize: 10, fontWeight: '700' },
  userEmail:    { fontSize: 12, color: Colors.textSecondary },
  userPhone:    { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  status:       { fontSize: 11, fontWeight: '600', marginTop: 3 },
  cardActions:  { flexDirection: 'row', gap: 8 },
  editIconBtn:  { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  toggleBtn:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  empty:        { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle:   { fontSize: 15, color: Colors.textMuted, fontWeight: '600' },
});
