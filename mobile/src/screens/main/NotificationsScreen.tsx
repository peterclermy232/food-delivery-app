import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { notificationApi } from '../../services/api';

interface Props { navigation: any; }

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        try {
          const res = await notificationApi.getAll();
          setNotifications(res.data.data || []);
        } catch (e) {
          console.error('Failed to load notifications', e);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [])
  );

  const handleTap = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (e) {}
  };

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

  const renderItem: ListRenderItem<any> = ({ item }) => (
    <TouchableOpacity
      style={[styles.notifRow, !item.isRead && styles.notifRowUnread]}
      onPress={() => handleTap(item.id)}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
      </View>
      <View style={styles.notifContent}>
        <Text style={styles.notifTitle}>{item.title}</Text>
        <Text style={styles.notifMessage}>{item.message}</Text>
        <Text style={styles.timestamp}>{timeAgo(item.createdAt)}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
      <Ionicons name="notifications-outline" size={52} color={Colors.border} />
      <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.dark, marginTop: 12 }}>No notifications yet</Text>
      <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>You'll see order updates here</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmpty}
        />
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
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 20, gap: 4 },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: Colors.border },
  notifRowUnread: { backgroundColor: `${Colors.primary}08` },
  iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: Colors.dark },
  notifMessage: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },
  timestamp: { fontSize: 11, color: Colors.textMuted, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
});
