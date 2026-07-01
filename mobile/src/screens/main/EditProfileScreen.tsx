import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../services/api';

interface Props { navigation: any; }

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await profileApi.update({ name, phone, bio });
      updateUser({ ...user!, name, phone: phone || user!.phone, bio });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarSection}>
          <View style={styles.avatar} />
          <TouchableOpacity style={styles.editAvatarBtn}>
            <Ionicons name="pencil" size={14} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Input label="FULL NAME" placeholder="Full name" value={name} onChangeText={setName} />
          <Input label="EMAIL" placeholder="Email" value={user?.email || ''} onChangeText={() => {}} keyboardType="email-address" autoCapitalize="none" editable={false} />
          <Input label="PHONE NUMBER" placeholder="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Input label="BIO" placeholder="Tell us about yourself" value={bio} onChangeText={setBio} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="SAVE" onPress={handleSave} loading={loading} style={{ width: '100%' }} />
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
  content: { flex: 1 },
  avatarSection: { alignItems: 'center', paddingVertical: 24, position: 'relative' },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.primaryLight },
  editAvatarBtn: {
    position: 'absolute', bottom: 22, right: '40%',
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  form: { paddingHorizontal: 20 },
  footer: { paddingHorizontal: 20, paddingBottom: 36 },
});
