import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface State { hasError: boolean; }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Wire up Sentry or another error reporting service here
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.subtitle}>An unexpected error occurred. Please try again.</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => this.setState({ hasError: false })}
        >
          <Text style={styles.btnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: Colors.white },
  emoji:      { fontSize: 48, marginBottom: 16 },
  title:      { fontSize: 20, fontWeight: '700', color: Colors.dark, marginBottom: 8 },
  subtitle:   { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  btn:        { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 36 },
  btnText:    { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
