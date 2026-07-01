import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { addressApi } from '../../services/api';

interface Props { navigation: any; route: any; }

const labels = ['Home', 'Work', 'Other'];

const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : 'Home';

export const SaveLocationScreen: React.FC<Props> = ({ navigation, route }) => {
  const editAddress = route?.params?.editAddress;
  const isEditing = !!editAddress;

  const [address, setAddress] = useState(editAddress?.fullAddress || '');
  const [street, setStreet] = useState(editAddress?.street || '');
  const [postCode, setPostCode] = useState(editAddress?.postCode || '');
  const [apartment, setApartment] = useState(editAddress?.apartment || '');
  const [selectedLabel, setSelectedLabel] = useState(editAddress?.label ? capitalize(editAddress.label) : 'Home');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!address.trim() && !street.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        label: selectedLabel.toUpperCase(),
        fullAddress: address || `${street}, ${postCode}`,
        street,
        postCode,
        apartment,
      };
      if (isEditing) {
        await addressApi.update(editAddress.id, payload);
      } else {
        await addressApi.create(payload);
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Map placeholder */}
      <View style={styles.map}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <View style={styles.backCircle}><Text style={styles.backArrow}>‹</Text></View>
        </TouchableOpacity>
        <View style={styles.pinContainer}>
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>{isEditing ? 'Edit location' : 'Move to edit location'}</Text>
          </View>
          <View style={styles.pin}>
            <View style={styles.pinInner} />
          </View>
        </View>
      </View>

      <ScrollView style={styles.sheet} showsVerticalScrollIndicator={false}>
        <Input label="ADDRESS" placeholder="Street address" value={address} onChangeText={setAddress} />
        <View style={styles.row}>
          <Input label="STREET" placeholder="Street" value={street} onChangeText={setStreet} style={styles.half} />
          <Input label="POST CODE" placeholder="Post code" value={postCode} onChangeText={setPostCode} style={styles.half} keyboardType="numeric" />
        </View>
        <Input label="APPARTMENT" placeholder="Apartment" value={apartment} onChangeText={setApartment} />

        <Text style={styles.labelTitle}>LABEL AS</Text>
        <View style={styles.labelsRow}>
          {labels.map(l => (
            <TouchableOpacity
              key={l}
              style={[styles.labelChip, selectedLabel === l && styles.labelChipActive]}
              onPress={() => setSelectedLabel(l)}
            >
              <Text style={[styles.labelChipText, selectedLabel === l && styles.labelChipTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={isEditing ? 'UPDATE LOCATION' : 'SAVE LOCATION'}
          onPress={handleSave}
          loading={loading}
          style={{ marginTop: 8, marginBottom: 36 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  map: { height: 240, backgroundColor: '#C8D6E0', justifyContent: 'space-between', padding: 20, paddingTop: 56, alignItems: 'center' },
  backBtn: { position: 'absolute', top: 56, left: 20 },
  backCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  backArrow: { fontSize: 24, color: Colors.dark, lineHeight: 28 },
  pinContainer: { position: 'absolute', top: '50%', left: '50%', marginLeft: -60, marginTop: -60, alignItems: 'center' },
  tooltip: { backgroundColor: Colors.dark, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 6 },
  tooltipText: { fontSize: 12, color: Colors.white },
  pin: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  pinInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.white },
  sheet: { flex: 1, padding: 20 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  labelTitle: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.8, marginBottom: 10 },
  labelsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  labelChip: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border },
  labelChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  labelChipText: { fontSize: 13, color: Colors.dark },
  labelChipTextActive: { color: Colors.white, fontWeight: '600' },
});
