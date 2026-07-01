import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { adminApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Props { navigation: any; }

interface StatCard { label: string; value: number; icon: string; color: string; bg: string; }

export const AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await adminApi.getStats();
      setStats(res.data.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const statCards: StatCard[] = [
    { label: 'Sellers',   value: stats?.totalSellers   ?? 0, icon: 'storefront-outline',  color: '#6C6FE5', bg: '#EDEDFF' },
    { label: 'Riders',    value: stats?.totalRiders    ?? 0, icon: 'bicycle-outline',      color: Colors.success, bg: '#DCFCE7' },
    { label: 'Customers', value: stats?.totalCustomers ?? 0, icon: 'people-outline',       color: Colors.primary, bg: Colors.primaryLight },
    { label: 'Orders',    value: stats?.totalOrders    ?? 0, icon: 'receipt-outline',      color: '#F59E0B', bg: '#FEF3C7' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSub}>Welcome, {user?.name?.split(' ')[0]}</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('OnboardUser')}
        >
          <Ionicons name="person-add-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(true); }}
            colors={[Colors.primary]}
          />
        }
      >
        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
        ) : (
          <>
            {/* Stats grid */}
            <View style={styles.statsGrid}>
              {statCards.map(card => (
                <View key={card.label} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: card.bg }]}>
                    <Ionicons name={card.icon as any} size={22} color={card.color} />
                  </View>
                  <Text style={[styles.statValue, { color: card.color }]}>{card.value}</Text>
                  <Text style={styles.statLabel}>{card.label}</Text>
                </View>
              ))}
            </View>

            {/* Quick actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('AdminUsers', { filterRole: 'seller' })}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#EDEDFF' }]}>
                  <Ionicons name="storefront-outline" size={24} color="#6C6FE5" />
                </View>
                <Text style={styles.actionLabel}>Manage Sellers</Text>
                <Text style={styles.actionSub}>View, enable & disable</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('AdminUsers', { filterRole: 'rider' })}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="bicycle-outline" size={24} color={Colors.success} />
                </View>
                <Text style={styles.actionLabel}>Manage Riders</Text>
                <Text style={styles.actionSub}>View, enable & disable</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('OnboardUser')}
              >
                <View style={[styles.actionIcon, { backgroundColor: Colors.primaryLight }]}>
                  <Ionicons name="person-add-outline" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.actionLabel}>Onboard User</Text>
                <Text style={styles.actionSub}>Add seller or rider</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('AdminUsers', {})}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="people-outline" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.actionLabel}>All Users</Text>
                <Text style={styles.actionSub}>Full user directory</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F4F6FA' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, backgroundColor: Colors.white },
  headerTitle:  { fontSize: 20, fontWeight: '800', color: Colors.dark },
  headerSub:    { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  addBtn:       { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  statCard:     { flex: 1, minWidth: '44%', backgroundColor: Colors.white, borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  statIcon:     { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue:    { fontSize: 28, fontWeight: '800', marginBottom: 2 },
  statLabel:    { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark, paddingHorizontal: 20, marginBottom: 12 },
  actionsGrid:  { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, paddingBottom: 40 },
  actionCard:   { flex: 1, minWidth: '44%', backgroundColor: Colors.white, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  actionIcon:   { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionLabel:  { fontSize: 14, fontWeight: '700', color: Colors.dark, marginBottom: 2 },
  actionSub:    { fontSize: 11, color: Colors.textSecondary },
});
