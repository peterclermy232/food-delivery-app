import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface Props {
  onFinish: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.f}>F</Text>
        <View style={styles.oBg}>
          <Text style={styles.oText}>O</Text>
        </View>
        <Text style={styles.od}>od</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  logo: { flexDirection: 'row', alignItems: 'center' },
  f: { fontSize: 48, fontWeight: '900', color: Colors.dark },
  oBg: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  oText: { fontSize: 28, fontWeight: '900', color: Colors.white },
  od: { fontSize: 48, fontWeight: '900', color: Colors.dark },
});
