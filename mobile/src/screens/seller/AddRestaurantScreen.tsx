import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Switch, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { sellerApi } from '../../services/api';
import { pickAndUploadImage } from '../../utils/imageUpload';

interface Props { navigation: any; route: any; }

const CATEGORY_OPTIONS = [
  'Burgers', 'Pizza', 'Sushi', 'Chinese', 'Indian', 'Mexican',
  'Italian', 'Seafood', 'Vegetarian', 'Desserts', 'Drinks', 'Breakfast', 'Fast Food', 'Healthy',
];

export const AddRestaurantScreen: React.FC<Props> = ({ navigation, route }) => {
  const existing = route?.params?.restaurant;
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [address, setAddress] = useState(existing?.address || '');
  const [deliveryFee, setDeliveryFee] = useState(existing?.deliveryFee?.toString() || '');
  const [deliveryTime, setDeliveryTime] = useState(existing?.deliveryTimeMinutes?.toString() || '');
  const [isOpen, setIsOpen] = useState(existing?.isOpen ?? true);
  const [selectedCats, setSelectedCats] = useState<string[]>(existing?.categories || []);
  const [imageUrl, setImageUrl] = useState<string | null>(existing?.imageUrl || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    setUploadingImage(true);
    try {
      const url = await pickAndUploadImage();
      if (url) setImageUrl(url);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to upload photo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const toggleCat = (cat: string) => {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Restaurant name is required.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Address is required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        imageUrl,
        address: address.trim(),
        deliveryFee: parseFloat(deliveryFee) || 0,
        deliveryTimeMinutes: parseInt(deliveryTime) || 30,
        isOpen,
        categories: selectedCats,
      };
      if (isEdit) {
        await sellerApi.updateRestaurant(existing.id, payload);
      } else {
        await sellerApi.createRestaurant(payload);
      }
      Alert.alert(
        'Success',
        isEdit ? 'Restaurant updated.' : 'Restaurant created successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save restaurant.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }: any) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textarea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEdit ? 'Edit Restaurant' : 'Add Restaurant'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.fieldLabel}>Photo</Text>
          <TouchableOpacity style={styles.photoPicker} onPress={handlePickImage} disabled={uploadingImage}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.photoPreview} resizeMode="cover" />
            ) : (
              <View style={styles.photoPlaceholder}>
                {uploadingImage ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={28} color={Colors.textSecondary} />
                    <Text style={styles.photoPlaceholderText}>Add a photo</Text>
                  </>
                )}
              </View>
            )}
            {imageUrl && uploadingImage && (
              <View style={styles.photoOverlay}><ActivityIndicator color={Colors.white} /></View>
            )}
            {imageUrl && !uploadingImage && (
              <View style={styles.photoEditBadge}>
                <Ionicons name="camera" size={14} color={Colors.white} />
              </View>
            )}
          </TouchableOpacity>

          <Field label="Restaurant Name *" value={name} onChangeText={setName} placeholder="e.g. Mario's Kitchen" />
          <Field label="Description" value={description} onChangeText={setDescription} placeholder="What makes your restaurant special?" multiline />
          <Field label="Address *" value={address} onChangeText={setAddress} placeholder="Street, City" />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Delivery Fee ($)" value={deliveryFee} onChangeText={setDeliveryFee} placeholder="2.99" keyboardType="decimal-pad" />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Field label="Delivery Time (min)" value={deliveryTime} onChangeText={setDeliveryTime} placeholder="30" keyboardType="number-pad" />
            </View>
          </View>

          {isEdit && (
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.fieldLabel}>Restaurant Status</Text>
                <Text style={styles.toggleSub}>{isOpen ? 'Open — accepting orders' : 'Closed — not taking orders'}</Text>
              </View>
              <Switch
                value={isOpen}
                onValueChange={setIsOpen}
                trackColor={{ false: Colors.border, true: `${Colors.primary}60` }}
                thumbColor={isOpen ? Colors.primary : Colors.textMuted}
              />
            </View>
          )}

          <Text style={styles.fieldLabel}>Categories</Text>
          <Text style={styles.catHint}>Select all that apply</Text>
          <View style={styles.catGrid}>
            {CATEGORY_OPTIONS.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, selectedCats.includes(cat) && styles.catChipActive]}
                onPress={() => toggleCat(cat)}
              >
                <Text style={[styles.catChipText, selectedCats.includes(cat) && styles.catChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <>
                  <Ionicons name={isEdit ? 'checkmark-circle' : 'add-circle'} size={20} color={Colors.white} />
                  <Text style={styles.saveBtnText}>{isEdit ? 'Update Restaurant' : 'Create Restaurant'}</Text>
                </>
            }
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.white },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn:         { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.inputBg, alignItems: 'center', justifyContent: 'center' },
  backArrow:       { fontSize: 24, color: Colors.dark, lineHeight: 28 },
  headerTitle:     { fontSize: 18, fontWeight: '700', color: Colors.dark },
  content:         { padding: 20, paddingBottom: 40, gap: 4 },
  row:             { flexDirection: 'row' },
  fieldGroup:      { marginBottom: 16 },
  fieldLabel:      { fontSize: 13, fontWeight: '700', color: Colors.dark, marginBottom: 7 },
  photoPicker:       { width: '100%', height: 160, borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  photoPreview:      { width: '100%', height: '100%' },
  photoPlaceholder:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.inputBg, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed', gap: 6 },
  photoPlaceholderText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  photoOverlay:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  photoEditBadge:    { position: 'absolute', bottom: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  input:           { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: Colors.dark, backgroundColor: Colors.inputBg },
  textarea:        { minHeight: 90, paddingTop: 12 },
  toggleRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, padding: 14, marginBottom: 16, backgroundColor: Colors.inputBg },
  toggleSub:       { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  catHint:         { fontSize: 12, color: Colors.textSecondary, marginBottom: 10 },
  catGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 },
  catChip:         { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  catChipActive:   { borderColor: Colors.primary, backgroundColor: `${Colors.primary}12` },
  catChipText:     { fontSize: 13, color: Colors.textSecondary },
  catChipTextActive: { color: Colors.primary, fontWeight: '600' },
  saveBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 14, height: 54 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText:     { fontSize: 15, fontWeight: '700', color: Colors.white },
});
