import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

interface Props { navigation: any; }

export const AddCardScreen: React.FC<Props> = ({ navigation }) => {
  const [holderName, setHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ');
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return cleaned;
  };

  const handleSubmit = async () => {
    if (!holderName || !cardNumber || !expiry || !cvc) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Card</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        <Input label="CARD HOLDER NAME" placeholder="Vishal Khadok" value={holderName} onChangeText={setHolderName} />
        <Input
          label="CARD NUMBER"
          placeholder="2134 L___ ____"
          value={cardNumber}
          onChangeText={t => setCardNumber(formatCardNumber(t))}
          keyboardType="numeric"
        />
        <View style={styles.row}>
          <Input
            label="EXPIRE DATE"
            placeholder="mm/yyyy"
            value={expiry}
            onChangeText={t => setExpiry(formatExpiry(t))}
            keyboardType="numeric"
            style={styles.half}
          />
          <Input
            label="CVC"
            placeholder="***"
            value={cvc}
            onChangeText={t => setCvc(t.slice(0, 3))}
            keyboardType="numeric"
            style={styles.half}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="ADD & MAKE PAYMENT" onPress={handleSubmit} loading={loading} style={{ width: '100%' }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.inputBg, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 16, color: Colors.dark },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  footer: { paddingHorizontal: 20, paddingBottom: 36 },
});
