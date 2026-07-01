import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

interface Props { navigation: any; }

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) { Alert.alert('Error', 'Please enter your email.'); return; }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      navigation.navigate('Verification', { email, type: 'reset' });
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.darkTop}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <View style={styles.backCircle}>
              <Text style={styles.backArrow}>‹</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>Please sign in to your existing account</Text>
        </View>

        <View style={styles.card}>
          <Input label="EMAIL" placeholder="example@gmail.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Button title="SEND CODE" onPress={handleSendCode} loading={loading} style={{ marginTop: 8 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  darkTop: { paddingTop: 60, paddingHorizontal: 32, paddingBottom: 48, overflow: 'hidden' },
  decorCircle1: { position: 'absolute', top: -60, left: -60, width: 200, height: 200, borderRadius: 100, borderWidth: 40, borderColor: 'rgba(255,255,255,0.05)' },
  decorCircle2: { position: 'absolute', top: -20, right: -80, width: 240, height: 240, borderRadius: 120, borderWidth: 30, borderColor: 'rgba(255,107,53,0.15)' },
  backBtn: { marginBottom: 24 },
  backCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, color: Colors.white, lineHeight: 28 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.white, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textMuted },
  card: { flex: 1, backgroundColor: Colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 32 },
});
