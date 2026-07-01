import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { adminApi } from '../../services/api';

interface Props { navigation: any; route: any; }

export const OnboardUserScreen: React.FC<Props> = ({ navigation, route }) => {
  const existing = route?.params?.user;
  const isEdit = !!existing;

  const [name, setName]         = useState(existing?.name || '');
  const [email, setEmail]       = useState(existing?.email || '');
  const [phone, setPhone]       = useState(existing?.phone || '');
  const [role, setRole]         = useState<'seller' | 'rider'>(existing?.role === 'rider' ? 'rider' : 'seller');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSave = async () => {
    if (!name.trim())  { Alert.alert('Error', 'Name is required.'); return; }
    if (!email.trim()) { Alert.alert('Error', 'Email is required.'); return; }
    if (!isEdit && !password.trim()) { Alert.alert('Error', 'Password is required for new accounts.'); return; }

    setLoading(true);
    try {
      if (isEdit) {
        const payload: any = { name: name.trim(), email: email.trim(), phone: phone.trim() };
        if (password.trim()) payload.password = password.trim();
        await adminApi.updateUser(existing.id, payload);
        Alert.alert('Updated', `${name}'s details have been updated.`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await adminApi.createUser({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role,
          password: password.trim(),
        });
        Alert.alert(
          'Account Created',
          `${name} has been onboarded as a ${role}.\n\nThey can log in with:\n${email.trim()}\n${password.trim()}`,
          [{ text: 'Done', onPress: () => navigation.goBack() }]
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save user.');
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
          <Text style={styles.headerTitle}>{isEdit ? 'Edit User' : 'Onboard User'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Role picker — only shown when creating */}
          {!isEdit && (
            <>
              <Text style={styles.sectionTitle}>Role</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[styles.roleCard, role === 'seller' && styles.roleCardActive]}
                  onPress={() => setRole('seller')}
                >
                  <View style={[styles.roleIcon, { backgroundColor: role === 'seller' ? '#EDEDFF' : Colors.inputBg }]}>
                    <Ionicons name="storefront-outline" size={24} color={role === 'seller' ? '#6C6FE5' : Colors.textMuted} />
                  </View>
                  <Text style={[styles.roleLabel, role === 'seller' && { color: '#6C6FE5', fontWeight: '700' }]}>Seller</Text>
                  <Text style={styles.roleSub}>Manages a restaurant</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleCard, role === 'rider' && styles.roleCardActive]}
                  onPress={() => setRole('rider')}
                >
                  <View style={[styles.roleIcon, { backgroundColor: role === 'rider' ? '#DCFCE7' : Colors.inputBg }]}>
                    <Ionicons name="bicycle-outline" size={24} color={role === 'rider' ? Colors.success : Colors.textMuted} />
                  </View>
                  <Text style={[styles.roleLabel, role === 'rider' && { color: Colors.success, fontWeight: '700' }]}>Rider</Text>
                  <Text style={styles.roleSub}>Delivers orders</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Basic info */}
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. John Doe"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="john@example.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 555 000 0000"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
            />
            <Text style={styles.label}>{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</Text>
            <TextInput
              style={[styles.input, { marginBottom: 0 }]}
              value={password}
              onChangeText={setPassword}
              placeholder={isEdit ? '••••••••' : 'Minimum 8 characters'}
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
            />
          </View>

          {!isEdit && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
              <Text style={styles.infoText}>
                Share these credentials with the {role}. They can change their password after logging in.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <>
                  <Ionicons name={isEdit ? 'checkmark-circle' : 'person-add-outline'} size={20} color={Colors.white} />
                  <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : `Add ${role.charAt(0).toUpperCase() + role.slice(1)}`}</Text>
                </>
            }
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F4F6FA' },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn:         { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.inputBg, alignItems: 'center', justifyContent: 'center' },
  backArrow:       { fontSize: 24, color: Colors.dark, lineHeight: 28 },
  headerTitle:     { fontSize: 17, fontWeight: '700', color: Colors.dark },
  content:         { padding: 16, paddingBottom: 48, gap: 4 },
  sectionTitle:    { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginTop: 12, marginBottom: 10, paddingHorizontal: 2, letterSpacing: 0.5, textTransform: 'uppercase' },
  roleRow:         { flexDirection: 'row', gap: 12, marginBottom: 4 },
  roleCard:        { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: Colors.border },
  roleCardActive:  { borderColor: Colors.primary },
  roleIcon:        { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  roleLabel:       { fontSize: 15, fontWeight: '600', color: Colors.dark, marginBottom: 2 },
  roleSub:         { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  card:            { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  label:           { fontSize: 13, fontWeight: '600', color: Colors.dark, marginBottom: 7 },
  input:           { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10, fontSize: 14, color: Colors.dark, backgroundColor: Colors.inputBg, marginBottom: 14 },
  infoBox:         { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: Colors.primaryLight, borderRadius: 12, padding: 14, marginTop: 8 },
  infoText:        { flex: 1, fontSize: 12, color: Colors.primary, lineHeight: 18 },
  saveBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 14, height: 54, marginTop: 16 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText:     { fontSize: 15, fontWeight: '700', color: Colors.white },
});
