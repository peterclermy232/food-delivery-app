import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title, onPress, variant = 'primary', loading, disabled, style, textStyle,
}) => {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.white : Colors.primary} />
      ) : (
        <Text style={[
          styles.text,
          variant === 'primary' && styles.textPrimary,
          variant === 'outline' && styles.textOutline,
          variant === 'ghost' && styles.textGhost,
          textStyle,
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 56, borderRadius: 12, alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 24,
  },
  primary: { backgroundColor: Colors.primary },
  outline: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.primary },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.6 },
  text: { fontSize: 14, fontWeight: '700', letterSpacing: 1.2 },
  textPrimary: { color: Colors.white },
  textOutline: { color: Colors.primary },
  textGhost: { color: Colors.primary },
});
