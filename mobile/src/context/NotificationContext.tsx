import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { Animated, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './AuthContext';
import { notificationApi } from '../services/api';
import { Colors } from '../constants/Colors';

// Show banners and play sound when a push arrives while the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Android notification channel — must be set before any notifications fire
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('orders', {
    name: 'Order Updates',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: Colors.primary,
  });
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;
  try {
    const { data } = await Notifications.getExpoPushTokenAsync();
    return data;
  } catch {
    // No EAS project configured yet — token unavailable in bare dev builds
    return null;
  }
}

interface NotificationContextType {
  unreadCount: number;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refreshNotifications: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

interface ToastData { title: string; message: string; }

const POLL_INTERVAL = 30000;

const ToastBanner: React.FC<{ toast: ToastData; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start();

    const timer = setTimeout(() => {
      Animated.timing(slideAnim, { toValue: -120, duration: 300, useNativeDriver: true })
        .start(() => onDismiss());
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.toastWrap, { top: insets.top + 8, transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity style={styles.toast} onPress={onDismiss} activeOpacity={0.95}>
        <View style={styles.toastIcon}>
          <Ionicons name="notifications" size={18} color={Colors.white} />
        </View>
        <View style={styles.toastContent}>
          <Text style={styles.toastTitle} numberOfLines={1}>{toast.title}</Text>
          <Text style={styles.toastMessage} numberOfLines={2}>{toast.message}</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={16} color="rgba(255,255,255,0.65)" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState<ToastData | null>(null);
  const seenIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationApi.getAll();
      const all: any[] = res.data.data || [];
      setUnreadCount(all.filter(n => !n.isRead).length);

      if (!initialized.current) {
        all.forEach(n => seenIds.current.add(n.id));
        initialized.current = true;
        return;
      }

      const fresh = all.filter(n => !seenIds.current.has(n.id));
      all.forEach(n => seenIds.current.add(n.id));

      if (fresh.length > 0) {
        setToast({ title: fresh[0].title, message: fresh[0].message });
      }
    } catch {}
  }, [user]);

  // Polling — runs as long as there is a logged-in user
  useEffect(() => {
    if (!user) {
      seenIds.current.clear();
      initialized.current = false;
      setUnreadCount(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [user?.id]);

  // Push notifications — register token and refresh count when a push arrives
  useEffect(() => {
    if (!user) return;

    registerForPushNotificationsAsync().then(token => {
      if (token) {
        // TODO: send `token` to the backend so the server can target this device
        // e.g. userApi.registerPushToken(token)
      }
    });

    // When a push arrives while the app is open, sync the badge / toast
    const sub = Notifications.addNotificationReceivedListener(() => {
      poll();
    });

    return () => sub.remove();
  }, [user?.id]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshNotifications: poll }}>
      {children}
      {toast && <ToastBanner key={toast.title + toast.message} toast={toast} onDismiss={() => setToast(null)} />}
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    backgroundColor: Colors.dark,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },
  toastIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  toastContent: { flex: 1 },
  toastTitle: { fontSize: 13, fontWeight: '700', color: Colors.white },
  toastMessage: { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 2, lineHeight: 16 },
});
