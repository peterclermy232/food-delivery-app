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

const CATEGORIES = ['Burgers', 'Pizza', 'Sushi', 'Chinese', 'Indian', 'Mexican', 'Italian', 'Seafood', 'Vegetarian', 'Desserts', 'Drinks', 'Breakfast', 'Fast Food', 'Healthy'];
const MEAL_TIMES = ['Breakfast', 'Lunch', 'Dinner', 'All Day'];
const DEFAULT_SIZES = ['Small', 'Medium', 'Large', 'Extra Large'];

export const AddFoodScreen: React.FC<Props> = ({ navigation, route }) => {
  const { restaurantId, restaurantName, food: existing } = route?.params || {};
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [price, setPrice] = useState(existing?.price?.toString() || '');
  const [category, setCategory] = useState(existing?.category || '');
  const [mealTime, setMealTime] = useState(existing?.mealTime || 'All Day');
  const [sizes, setSizes] = useState<string[]>(existing?.sizes || []);
  const [customSize, setCustomSize] = useState('');
  const [forDelivery, setForDelivery] = useState(existing?.availableForDelivery ?? true);
  const [forPickup, setForPickup] = useState(existing?.availableForPickup ?? true);
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

  const toggleSize = (s: string) =>
    setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const addCustomSize = () => {
    const trimmed = customSize.trim();
    if (trimmed && !sizes.includes(trimmed)) {
      setSizes(prev => [...prev, trimmed]);
    }
    setCustomSize('');
  };

  const removeSize = (s: string) => setSizes(prev => prev.filter(x => x !== s));

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Food name is required.'); return; }
    if (!price || isNaN(parseFloat(price))) { Alert.alert('Error', 'Enter a valid price.'); return; }

    setLoading(true);
    try {
      const payload = {
        restaurantId: restaurantId || existing?.restaurantId,
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        imageUrl,
        category,
        mealTime,
        sizes,
        availableForDelivery: forDelivery,
        availableForPickup: forPickup,
      };
      if (isEdit) {
        await sellerApi.updateFood(existing.id, payload);
      } else {
        await sellerApi.createFood(payload);
      }
      Alert.alert('Success', isEdit ? 'Food item updated.' : 'Food item added!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save food item.');
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
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={styles.headerTitle}>{isEdit ? 'Edit Food Item' : 'Add Food Item'}</Text>
            {restaurantName ? <Text style={styles.headerSub}>{restaurantName}</Text> : null}
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Photo */}
          <Text style={styles.sectionTitle}>Photo</Text>
          <View style={styles.card}>
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
          </View>

          {/* Name & Price */}
          <Text style={styles.sectionTitle}>Basic Info</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Food Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Grilled Chicken Burger"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.label}>Price ($) *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="9.99"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
            />
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe this dish..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Category */}
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.card}>
            <View style={styles.chipGrid}>
              {CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, category === c && styles.chipActive]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Meal Time */}
          <Text style={styles.sectionTitle}>Meal Time</Text>
          <View style={styles.card}>
            <View style={styles.chipGrid}>
              {MEAL_TIMES.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.chip, mealTime === m && styles.chipActive]}
                  onPress={() => setMealTime(m)}
                >
                  <Text style={[styles.chipText, mealTime === m && styles.chipTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sizes */}
          <Text style={styles.sectionTitle}>Sizes <Text style={styles.sectionHint}>(optional)</Text></Text>
          <View style={styles.card}>
            <Text style={styles.label}>Quick add</Text>
            <View style={styles.chipGrid}>
              {DEFAULT_SIZES.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, sizes.includes(s) && styles.chipActive]}
                  onPress={() => toggleSize(s)}
                >
                  <Text style={[styles.chipText, sizes.includes(s) && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {sizes.filter(s => !DEFAULT_SIZES.includes(s)).length > 0 && (
              <View style={[styles.chipGrid, { marginTop: 8 }]}>
                {sizes.filter(s => !DEFAULT_SIZES.includes(s)).map(s => (
                  <TouchableOpacity key={s} style={styles.chipRemovable} onPress={() => removeSize(s)}>
                    <Text style={styles.chipRemovableText}>{s}</Text>
                    <Ionicons name="close-circle" size={14} color={Colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[styles.label, { marginTop: 12 }]}>Custom size</Text>
            <View style={styles.addSizeRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={customSize}
                onChangeText={setCustomSize}
                placeholder="e.g. Family"
                placeholderTextColor={Colors.textMuted}
                onSubmitEditing={addCustomSize}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addSizeBtn} onPress={addCustomSize}>
                <Ionicons name="add" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Availability */}
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Available for Delivery</Text>
                <Text style={styles.toggleSub}>Customers can order for delivery</Text>
              </View>
              <Switch
                value={forDelivery}
                onValueChange={setForDelivery}
                trackColor={{ false: Colors.border, true: `${Colors.primary}60` }}
                thumbColor={forDelivery ? Colors.primary : Colors.textMuted}
              />
            </View>
            <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 4, paddingTop: 14 }]}>
              <View>
                <Text style={styles.toggleLabel}>Available for Pickup</Text>
                <Text style={styles.toggleSub}>Customers can pick up in person</Text>
              </View>
              <Switch
                value={forPickup}
                onValueChange={setForPickup}
                trackColor={{ false: Colors.border, true: `${Colors.primary}60` }}
                thumbColor={forPickup ? Colors.primary : Colors.textMuted}
              />
            </View>
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
                  <Text style={styles.saveBtnText}>{isEdit ? 'Update Item' : 'Add to Menu'}</Text>
                </>
            }
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#F4F6FA' },
  header:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn:           { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.inputBg, alignItems: 'center', justifyContent: 'center' },
  backArrow:         { fontSize: 24, color: Colors.dark, lineHeight: 28 },
  headerTitle:       { fontSize: 17, fontWeight: '700', color: Colors.dark },
  headerSub:         { fontSize: 12, color: Colors.primary, marginTop: 1 },
  content:           { padding: 16, paddingBottom: 48, gap: 4 },
  sectionTitle:      { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginTop: 12, marginBottom: 8, paddingHorizontal: 2, letterSpacing: 0.5, textTransform: 'uppercase' },
  sectionHint:       { fontSize: 11, fontWeight: '400', color: Colors.textMuted, textTransform: 'none' },
  card:              { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  photoPicker:       { width: '100%', height: 160, borderRadius: 12, overflow: 'hidden' },
  photoPreview:      { width: '100%', height: '100%' },
  photoPlaceholder:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.inputBg, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed', gap: 6 },
  photoPlaceholderText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  photoOverlay:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  photoEditBadge:    { position: 'absolute', bottom: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  label:             { fontSize: 13, fontWeight: '600', color: Colors.dark, marginBottom: 7 },
  input:             { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10, fontSize: 14, color: Colors.dark, backgroundColor: Colors.inputBg, marginBottom: 14 },
  textarea:          { minHeight: 80, paddingTop: 10 },
  chipGrid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:              { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  chipActive:        { borderColor: Colors.primary, backgroundColor: `${Colors.primary}12` },
  chipText:          { fontSize: 13, color: Colors.textSecondary },
  chipTextActive:    { color: Colors.primary, fontWeight: '600' },
  chipRemovable:     { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: `${Colors.primary}10` },
  chipRemovableText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  addSizeRow:        { flexDirection: 'row', gap: 10, alignItems: 'center' },
  addSizeBtn:        { width: 42, height: 42, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  toggleRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel:       { fontSize: 14, fontWeight: '600', color: Colors.dark },
  toggleSub:         { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  saveBtn:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 14, height: 54, marginTop: 12 },
  saveBtnDisabled:   { opacity: 0.6 },
  saveBtnText:       { fontSize: 15, fontWeight: '700', color: Colors.white },
});
