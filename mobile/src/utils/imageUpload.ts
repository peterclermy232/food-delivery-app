import * as ImagePicker from 'expo-image-picker';
import { uploadApi } from '../services/api';

export async function pickImageFile(): Promise<{ uri: string; name: string; type: string } | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library permission is required to add a picture.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
  });

  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.fileName || `photo-${Date.now()}.jpg`,
    type: asset.mimeType || 'image/jpeg',
  };
}

export function toFormData(file: { uri: string; name: string; type: string }): FormData {
  const formData = new FormData();
  formData.append('file', file as unknown as Blob);
  return formData;
}

export async function pickAndUploadImage(): Promise<string | null> {
  const file = await pickImageFile();
  if (!file) return null;

  const res = await uploadApi.image(toFormData(file));
  return res.data.data.url as string;
}
