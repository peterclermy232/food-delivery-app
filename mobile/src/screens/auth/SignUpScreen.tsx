import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';

interface Props { navigation: any; }

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, phone, password);
    } catch (err: any) {
      Alert.alert('Registration failed', err?.response?.data?.message || 'Something went wrong.');
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <View style={styles.backCircle}>
              <Text style={styles.backArrow}>‹</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subtitle}>Please sign up to get started</Text>
        </View>

        <View style={styles.card}>
          <Input label="NAME" placeholder="john doe" value={name} onChangeText={setName} />
          <Input label="EMAIL" placeholder="example@gmail.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Input label="PHONE" placeholder="+1 (000) 000-0000" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Input label="PASSWORD" placeholder="• • • • • • • • • •" value={password} onChangeText={setPassword} secureTextEntry />
          <Input label="RE-TYPE PASSWORD" placeholder="• • • • • • • • • •" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

          <Button title="SIGN UP" onPress={handleSignUp} loading={loading} style={{ marginTop: 8 }} />

          <View style={styles.loginRow}>
            <Text style={styles.loginLabel}>Already have an account?  </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>LOG IN</Text>
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
    position: 'absolute', top: -60, left: -60, width: 200, height: 200,
    borderRadius: 100, borderWidth: 40, borderColor: 'rgba(255,255,255,0.05)',
  },
  decorCircle2: {
    position: 'absolute', top: -20, right: -80, width: 240, height: 240,
    borderRadius: 120, borderWidth: 30, borderColor: 'rgba(255,107,53,0.15)',
  },
  backBtn: { marginBottom: 24 },
  backCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 24, color: Colors.white, lineHeight: 28 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.white, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textMuted },
  card: {
    flex: 1, backgroundColor: Colors.white,
    borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 32,
  },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  loginLabel: { fontSize: 13, color: Colors.textSecondary },
  loginLink: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
});
