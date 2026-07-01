import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { Colors } from '../../constants/Colors';
import { Button } from '../../components/common/Button';
import { Ionicons } from '@expo/vector-icons';

interface Props { navigation: any; }

export const LocationPermissionScreen: React.FC<Props> = ({ navigation }) => {
  const handleAllow = async () => {
    await Location.requestForegroundPermissionsAsync();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.illustration}>
        <View style={styles.mapBg}>
          <Ionicons name="location" size={48} color={Colors.primary} />
        </View>
      </View>
      <View style={styles.footer}>
        <Button title="ACCESS LOCATION" onPress={handleAllow} style={styles.btn}>
        </Button>
        <Text style={styles.note}>DFOOD WILL ACCESS YOUR LOCATION{'\n'}ONLY WHILE USING THE APP</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, justifyContent: 'space-between', paddingTop: 80 },
  illustration: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mapBg: {
    width: 180, height: 200, borderRadius: 90,
    backgroundColor: Colors.inputBg, alignItems: 'center', justifyContent: 'center',
  },
  footer: { paddingHorizontal: 32, paddingBottom: 60, alignItems: 'center' },
  btn: { width: '100%', marginBottom: 20 },
  note: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', letterSpacing: 0.5, lineHeight: 18 },
});
