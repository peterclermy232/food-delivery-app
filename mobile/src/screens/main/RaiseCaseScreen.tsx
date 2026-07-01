import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { caseApi } from '../../services/api';

interface Props { navigation: any; route: any; }

const SUBJECTS = [
  'Item missing from order',
  'Wrong item delivered',
  'Order not delivered',
  'Food quality issue',
  'Late delivery',
  'Other',
];

export const RaiseCaseScreen: React.FC<Props> = ({ navigation, route }) => {
  const orderId: string = route?.params?.orderId;
  const orderNumber: string = route?.params?.orderNumber || '';
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingCases, setExistingCases] = useState<any[]>([]);

  useEffect(() => {
    if (!orderId) return;
    caseApi.getForOrder(orderId)
      .then(res => setExistingCases(res.data.data || []))
      .catch(() => {});
  }, [orderId]);

  const handleSubmit = async () => {
    if (!subject) {
      Alert.alert('Error', 'Please select a subject for your case.');
      return;
    }
    setLoading(true);
    try {
      await caseApi.raise(orderId, subject, description);
      Alert.alert(
        'Case Submitted',
        'Your case has been received. Our support team will review it shortly.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to submit case. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Raise a Case</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {orderNumber ? (
            <View style={styles.orderBadge}>
              <Text style={styles.orderBadgeText}>Order {orderNumber}</Text>
            </View>
          ) : null}

          {existingCases.length > 0 && (
            <View style={styles.existingCasesSection}>
              <Text style={styles.existingCasesTitle}>Previous Cases</Text>
              {existingCases.map(c => (
                <View key={c.id} style={styles.existingCaseCard}>
                  <View style={styles.existingCaseHeader}>
                    <Text style={styles.existingCaseSubject}>{c.subject}</Text>
                    <Text style={styles.existingCaseStatus}>{c.status.replace('_', ' ').toUpperCase()}</Text>
                  </View>
                  {c.replyMessage ? (
                    <View style={styles.sellerReplyBox}>
                      <Text style={styles.sellerReplyLabel}>Seller reply</Text>
                      <Text style={styles.sellerReplyText}>{c.replyMessage}</Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          )}

          <Text style={styles.label}>What went wrong?</Text>
          <View style={styles.subjectList}>
            {SUBJECTS.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.subjectChip, subject === s && styles.subjectChipActive]}
                onPress={() => setSubject(s)}
              >
                <Text style={[styles.subjectChipText, subject === s && styles.subjectChipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Additional details (optional)</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Describe the issue in more detail..."
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.submitBtnText}>Submit Case</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.inputBg, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, color: Colors.dark, lineHeight: 28 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  content: { padding: 20, paddingBottom: 40 },
  orderBadge: { backgroundColor: `${Colors.primary}15`, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: 20 },
  orderBadgeText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  label: { fontSize: 14, fontWeight: '700', color: Colors.dark, marginBottom: 12 },
  subjectList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  subjectChip: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  subjectChipActive: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}10` },
  subjectChipText: { fontSize: 13, color: Colors.textSecondary },
  subjectChipTextActive: { color: Colors.primary, fontWeight: '600' },
  textarea: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, padding: 14, fontSize: 14, color: Colors.dark, minHeight: 120, marginBottom: 24 },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center' },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  existingCasesSection: { marginBottom: 24 },
  existingCasesTitle: { fontSize: 14, fontWeight: '700', color: Colors.dark, marginBottom: 10 },
  existingCaseCard: { backgroundColor: Colors.inputBg, borderRadius: 12, padding: 14, marginBottom: 10 },
  existingCaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  existingCaseSubject: { fontSize: 14, fontWeight: '700', color: Colors.dark, flex: 1, marginRight: 8 },
  existingCaseStatus: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  sellerReplyBox: { backgroundColor: '#EEF2FF', borderRadius: 8, padding: 10, marginTop: 6 },
  sellerReplyLabel: { fontSize: 11, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  sellerReplyText: { fontSize: 13, color: Colors.dark },
});
