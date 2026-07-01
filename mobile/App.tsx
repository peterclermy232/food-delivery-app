import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { CurrencyProvider } from './src/context/CurrencyContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashScreen } from './src/screens/SplashScreen';

const Inner = () => {
  const { isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (isLoading || showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return <AppNavigator />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <CurrencyProvider>
          <AuthProvider>
            <CartProvider>
              <NotificationProvider>
                <Inner />
              </NotificationProvider>
            </CartProvider>
          </AuthProvider>
        </CurrencyProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
