import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ListRenderItem, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { addressApi } from '../../services/api';
import { Address } from '../../types';

interface Props { navigation: any; }

const addressIcons: Record<string, any> = { Home: 'home-outline', Work: 'briefcase-outline', Other: 'location-outline' };
const addressColors: Record<string, string> = { Home: Colors.primary, Work: '#6C6FE5', Other: Colors.textSecondary };

export const AddressScreen: React.FC<Props> = ({ navigation }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        try {
          const res = await addressApi.getAll();
          const raw: any[] = res.data.data || [];
          const normalized: Address[] = raw.map(a => ({
            ...a,
            label: a.label.charAt(0) + a.label.slice(1).toLowerCase(),
          }));
          setAddresses(normalized);
        } catch (e) {
          console.error('Failed to load addresses', e);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [])
  );

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await addressApi.delete(id);
            setAddresses(prev => prev.filter(a => a.id !== id));
          } catch (e) {
            Alert.alert('Error', 'Failed to delete address');
          }
        },
      },
    ]);
  };

  const renderAddress: ListRenderItem<Address> = ({ item }) => (
    <View style={styles.addressCard}>
      <View style={[styles.iconBg, { backgroundColor: `${addressColors[item.label]}20` }]}>
        <Ionicons name={addressIcons[item.label]} size={22} color={addressColors[item.label]} />
      </View>
      <View style={styles.addressInfo}>
        <Text style={styles.addressLabel}>{item.label.toUpperCase()}</Text>
        <Text style={styles.addressText}>{item.fullAddress}</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('SaveLocation', { editAddress: item })} style={styles.actionBtn}>
        <Ionicons name="create-outline" size={20} color={Colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
        <Ionicons name="trash-outline" size={20} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Address</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={item => item.id}
          renderItem={renderAddress}
          contentContainerStyle={styles.list}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('SaveLocation')}>
          <Text style={styles.addBtnText}>ADD NEW ADDRESS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.inputBg, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, color: Colors.dark, lineHeight: 28 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  list: { padding: 20, gap: 16 },
  addressCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.inputBg, borderRadius: 16, padding: 16,
  },
  iconBg: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  addressInfo: { flex: 1 },
  addressLabel: { fontSize: 11, fontWeight: '700', color: Colors.dark, letterSpacing: 0.8, marginBottom: 4 },
  addressText: { fontSize: 12, color: Colors.textSecondary },
  actionBtn: { padding: 4 },
  footer: { paddingHorizontal: 20, paddingBottom: 36 },
  addBtn: { backgroundColor: Colors.primary, borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white, letterSpacing: 1.2 },
});
