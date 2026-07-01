import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { caseApi } from '../../services/api';

interface Props { navigation: any; }

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  open:      { label: 'Open',      color: Colors.error,         bg: '#FEE2E2' },
  in_review: { label: 'In Review', color: Colors.warning,       bg: '#FEF3C7' },
  resolved:  { label: 'Resolved',  color: Colors.success,       bg: '#DCFCE7' },
  closed:    { label: 'Closed',    color: Colors.textSecondary, bg: '#F3F4F6' },
};

export const MyCasesScreen: React.FC<Props> = ({ navigation }) => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        try {
          const res = await caseApi.getMyCases();
          setCases(res.data.data || []);
        } catch {}
        finally { setLoading(false); }
      };
      load();
    }, [])
  );

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const renderItem: ListRenderItem<any> = ({ item }) => {
    const meta = STATUS_META[item.status] || STATUS_META.open;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.orderRef}>{item.orderNumber || item.orderId}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>

        {item.description ? (
          <Text style={styles.description}>{item.description}</Text>
        ) : null}

        {item.replyMessage ? (
          <View style={styles.replyBox}>
            <View style={styles.replyHeader}>
              <Ionicons name="chatbubble-ellipses" size={13} color={Colors.primary} />
              <Text style={styles.replyLabel}>Restaurant reply</Text>
              {item.repliedAt ? <Text style={styles.replyTime}>{timeAgo(item.repliedAt)}</Text> : null}
            </View>
            <Text style={styles.replyText}>{item.replyMessage}</Text>
          </View>
        ) : (
          <View style={styles.pendingBox}>
            <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.pendingText}>Awaiting restaurant reply</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cases</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={cases}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="shield-checkmark-outline" size={52} color={Colors.border} />
              <Text style={styles.emptyTitle}>No cases yet</Text>
              <Text style={styles.emptyText}>Support cases for your orders will appear here</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.white },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.inputBg, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, color: Colors.dark, lineHeight: 28 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 40, gap: 12 },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  subject: { fontSize: 15, fontWeight: '700', color: Colors.dark },
  orderRef: { fontSize: 12, color: Colors.primary, marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8, flexShrink: 0 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  description: { fontSize: 13, color: Colors.textSecondary, marginBottom: 10, lineHeight: 18 },
  replyBox: { backgroundColor: '#EEF2FF', borderRadius: 10, padding: 12, marginTop: 4 },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  replyLabel: { fontSize: 12, fontWeight: '700', color: Colors.primary, flex: 1 },
  replyTime: { fontSize: 11, color: Colors.textMuted },
  replyText: { fontSize: 13, color: Colors.dark, lineHeight: 18 },
  pendingBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  pendingText: { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic' },
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark, marginTop: 12 },
  emptyText: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, textAlign: 'center', paddingHorizontal: 40 },
});
