import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface Props { navigation: any; }

export const ChatScreen: React.FC<Props> = ({ navigation }) => (
  <SafeAreaView style={styles.container} edges={['top']}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={Colors.dark} />
      </TouchableOpacity>
      <Text style={styles.title}>Messages</Text>
      <View style={{ width: 24 }} />
    </View>
    <View style={styles.center}>
      <View style={styles.iconWrap}>
        <Ionicons name="chatbubbles-outline" size={52} color={Colors.primary} />
      </View>
      <Text style={styles.heading}>Chat Coming Soon</Text>
      <Text style={styles.sub}>
        In-app messaging with riders and support{'\n'}will be available in the next update.
      </Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  iconWrap: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  heading: { fontSize: 20, fontWeight: '800', color: Colors.dark, marginBottom: 10 },
  sub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
