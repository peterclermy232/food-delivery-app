import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { caseApi } from '../../services/api';

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  open:      { label: 'Open',      color: Colors.error,         bg: '#FEE2E2' },
  in_review: { label: 'In Review', color: Colors.warning,       bg: '#FEF3C7' },
  resolved:  { label: 'Resolved',  color: Colors.success,       bg: '#DCFCE7' },
  closed:    { label: 'Closed',    color: Colors.textSecondary, bg: '#F3F4F6' },
};

export const SellerCasesScreen: React.FC = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadCases = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await caseApi.getSellerCases();
      setCases(res.data.data || []);
    } catch {
      if (!silent) Alert.alert('Error', 'Could not load cases');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadCases(); }, []));

  const handleReply = async (caseId: string) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await caseApi.replyToCase(caseId, replyText.trim());
      setReplyingTo(null);
      setReplyText('');
      await loadCases(true);
    } catch {
      Alert.alert('Error', 'Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const openCases   = cases.filter(c => ['open', 'in_review'].includes(c.status));
  const closedCases = cases.filter(c => ['resolved', 'closed'].includes(c.status));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Customer Cases</Text>
          <Text style={styles.headerSub}>{openCases.length} open · {closedCases.length} resolved</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => loadCases()}>
          <Ionicons name="refresh" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadCases(); }} colors={[Colors.primary]} />}
        >
          {cases.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="shield-checkmark-outline" size={52} color={Colors.border} />
              <Text style={styles.emptyTitle}>No complaints</Text>
              <Text style={styles.emptyText}>Customer cases will appear here</Text>
            </View>
          )}

          {cases.map(c => {
            const meta = STATUS_META[c.status] || STATUS_META.open;
            const isReplying = replyingTo === c.id;
            return (
              <View key={c.id} style={[styles.card, c.status === 'open' && styles.cardUrgent]}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subject}>{c.subject}</Text>
                    <Text style={styles.orderRef}>{c.orderNumber || c.orderId}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: meta.bg }]}>
                    <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                </View>

                {c.description ? (
                  <Text style={styles.description}>{c.description}</Text>
                ) : null}

                {c.replyMessage ? (
                  <View style={styles.replyBox}>
                    <Text style={styles.replyLabel}>Your reply</Text>
                    <Text style={styles.replyText}>{c.replyMessage}</Text>
                  </View>
                ) : null}

                {!c.replyMessage && !isReplying && (
                  <TouchableOpacity style={styles.replyBtn} onPress={() => { setReplyingTo(c.id); setReplyText(''); }}>
                    <Ionicons name="chatbubble-outline" size={14} color={Colors.primary} />
                    <Text style={styles.replyBtnText}>Reply to customer</Text>
                  </TouchableOpacity>
                )}

                {isReplying && (
                  <View style={styles.replyInputBlock}>
                    <TextInput
                      style={styles.replyInput}
                      placeholder="Type your reply..."
                      value={replyText}
                      onChangeText={setReplyText}
                      multiline
                      autoFocus
                    />
                    <View style={styles.replyActions}>
                      <TouchableOpacity style={styles.cancelBtn} onPress={() => setReplyingTo(null)}>
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.sendBtn, !replyText.trim() && styles.sendBtnDisabled]}
                        onPress={() => handleReply(c.id)}
                        disabled={!replyText.trim() || submitting}
                      >
                        {submitting
                          ? <ActivityIndicator size="small" color={Colors.white} />
                          : <Text style={styles.sendBtnText}>Send</Text>
                        }
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F4F6FA' },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, backgroundColor: Colors.white },
  headerTitle:     { fontSize: 20, fontWeight: '800', color: Colors.dark },
  headerSub:       { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  refreshBtn:      { width: 38, height: 38, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content:         { padding: 16, paddingBottom: 40 },
  emptyState:      { alignItems: 'center', paddingVertical: 60 },
  emptyTitle:      { fontSize: 16, fontWeight: '700', color: Colors.dark, marginTop: 12 },
  emptyText:       { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  card:            { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardUrgent:      { borderLeftWidth: 4, borderLeftColor: Colors.error },
  cardTop:         { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  subject:         { fontSize: 15, fontWeight: '700', color: Colors.dark },
  orderRef:        { fontSize: 12, color: Colors.primary, marginTop: 2 },
  badge:           { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8 },
  badgeText:       { fontSize: 12, fontWeight: '700' },
  description:     { fontSize: 13, color: Colors.textSecondary, marginBottom: 10, lineHeight: 18 },
  replyBox:        { backgroundColor: '#EEF2FF', borderRadius: 10, padding: 10, marginTop: 8 },
  replyLabel:      { fontSize: 11, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  replyText:       { fontSize: 13, color: Colors.dark },
  replyBtn:        { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingVertical: 8 },
  replyBtnText:    { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  replyInputBlock: { marginTop: 10 },
  replyInput:      { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 10, fontSize: 13, minHeight: 80, textAlignVertical: 'top' },
  replyActions:    { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  cancelBtn:       { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  cancelBtnText:   { fontSize: 13, color: Colors.textSecondary },
  sendBtn:         { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, backgroundColor: Colors.primary },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText:     { fontSize: 13, fontWeight: '700', color: Colors.white },
});
