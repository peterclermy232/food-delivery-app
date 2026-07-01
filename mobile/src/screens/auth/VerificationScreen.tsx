import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Button } from '../../components/common/Button';

interface Props { navigation: any; route: any; }

export const VerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email, type } = route.params || {};
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(50);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 3) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 4) { Alert.alert('Error', 'Please enter the 4-digit code.'); return; }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      navigation.replace('Main');
    } catch {
      Alert.alert('Error', 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <View style={styles.darkTop}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <View style={styles.backCircle}>
              <Text style={styles.backArrow}>‹</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subtitle}>We have sent a code to your email</Text>
          <Text style={styles.email}>{email || 'example@gmail.com'}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>CODE</Text>
            <TouchableOpacity onPress={() => setTimer(50)} disabled={timer > 0}>
              <Text style={[styles.resendText, timer > 0 && styles.resendDisabled]}>
                Resend {timer > 0 ? `in.${timer}sec` : ''}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={el => { inputs.current[i] = el; }}
                style={[styles.otpInput, digit && styles.otpInputFilled]}
                value={digit}
                onChangeText={t => handleChange(t.slice(-1), i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
              />
            ))}
          </View>

          <Button title="VERIFY" onPress={handleVerify} loading={loading} style={{ marginTop: 24 }} />
        </View>
      </View>
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
  email: { fontSize: 14, color: Colors.white, fontWeight: '600', marginTop: 4 },
  card: { flex: 1, backgroundColor: Colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 32 },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  codeLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.8, textTransform: 'uppercase' },
  resendText: { fontSize: 13, color: Colors.primary, textDecorationLine: 'underline' },
  resendDisabled: { color: Colors.textMuted, textDecorationLine: 'none' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  otpInput: {
    flex: 1, height: 60, borderRadius: 12, backgroundColor: Colors.inputBg,
    fontSize: 24, fontWeight: '700', color: Colors.dark,
  },
  otpInputFilled: { backgroundColor: Colors.primaryLight, borderWidth: 1.5, borderColor: Colors.primary },
});
