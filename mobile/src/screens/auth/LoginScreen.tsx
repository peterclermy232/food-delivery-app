import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface Props { navigation: any; }

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      Alert.alert('Login failed', err?.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.darkTop}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
          <Text style={styles.title}>Log In</Text>
          <Text style={styles.subtitle}>Please sign in to your existing account</Text>
        </View>

        <View style={styles.card}>
          <Input label="EMAIL" placeholder="example@gmail.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Input label="PASSWORD" placeholder="• • • • • • • • • •" value={password} onChangeText={setPassword} secureTextEntry />

          <View style={styles.row}>
            <TouchableOpacity style={styles.rememberRow} onPress={() => setRememberMe(!rememberMe)}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Ionicons name="checkmark" size={12} color={Colors.white} />}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>Forgot Password</Text>
            </TouchableOpacity>
          </View>

          <Button title="LOG IN" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />

          <View style={styles.signupRow}>
            <Text style={styles.signupLabel}>Don't have an account?  </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signupLink}>SIGN UP</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.orText}>Or</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#3b5998' }]}>
              <Ionicons name="logo-facebook" size={22} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#1da1f2' }]}>
              <Ionicons name="logo-twitter" size={22} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialBtn, { backgroundColor: Colors.dark }]}>
              <Ionicons name="logo-apple" size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  darkTop: { paddingTop: 60, paddingHorizontal: 32, paddingBottom: 48, overflow: 'hidden' },
  decorCircle1: {
    position: 'absolute', top: -60, left: -60,
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 40, borderColor: 'rgba(255,255,255,0.05)',
  },
  decorCircle2: {
    position: 'absolute', top: -20, right: -80,
    width: 240, height: 240, borderRadius: 120,
    borderWidth: 30, borderColor: 'rgba(255,107,53,0.15)',
  },
  title: { fontSize: 28, fontWeight: '800', color: Colors.white, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textMuted },
  card: {
    flex: 1, backgroundColor: Colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30,
    padding: 32,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 18, height: 18, borderRadius: 4, borderWidth: 1.5,
    borderColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  rememberText: { fontSize: 13, color: Colors.textSecondary },
  forgotText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  signupLabel: { fontSize: 13, color: Colors.textSecondary },
  signupLink: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  orText: { fontSize: 13, color: Colors.textSecondary },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  socialBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
});
