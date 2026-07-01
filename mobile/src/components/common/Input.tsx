import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: ViewStyle;
  editable?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label, placeholder, value, onChangeText, secureTextEntry,
  keyboardType = 'default', autoCapitalize = 'sentences', style, editable = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: 11, fontWeight: '600', color: Colors.textSecondary,
    letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase',
  },
  inputWrapper: {
    backgroundColor: Colors.inputBg,
    borderRadius: 12, flexDirection: 'row', alignItems: 'center',
  },
  input: {
    flex: 1, height: 52, paddingHorizontal: 16,
    fontSize: 14, color: Colors.textPrimary,
  },
  eyeBtn: { paddingRight: 16 },
});
