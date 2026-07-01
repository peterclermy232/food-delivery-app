import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';

interface Props { navigation: any; route: any; }

export const OrderSuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const orderId = route?.params?.orderId;
  return (
    <View style={styles.container}>
      <View style={styles.illustration}>
        <View style={styles.imagePlaceholder} />
      </View>
      <Text style={styles.title}>Congratulations!</Text>
      <Text style={styles.subtitle}>You successfully maked a payment,{'\n'}enjoy our service!</Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('TrackOrder', { orderId })}
      >
        <Text style={styles.btnText}>TRACK ORDER</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.homeBtnText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', padding: 32 },
  illustration: { marginBottom: 40 },
  imagePlaceholder: { width: 180, height: 180, borderRadius: 24, backgroundColor: Colors.inputBg },
  title: { fontSize: 26, fontWeight: '800', color: Colors.dark, marginBottom: 12 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  btn: { width: '100%', backgroundColor: Colors.primary, borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 14, fontWeight: '700', color: Colors.white, letterSpacing: 1.2 },
  homeBtn: { marginTop: 16, alignItems: 'center' },
  homeBtnText: { fontSize: 14, color: Colors.textSecondary, textDecorationLine: 'underline' },
});
