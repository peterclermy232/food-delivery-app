import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('auth_token');
      const storedUser = await AsyncStorage.getItem('auth_user');
      if (storedToken && storedUser) {
        const parsed = JSON.parse(storedUser);
        setToken(storedToken);
        setUser({ ...parsed, role: parsed.role?.toLowerCase() });
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeUser = (u: any): User => ({ ...u, role: u.role?.toLowerCase() });

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    const { token: authToken, user: authUser } = response.data.data;
    const normalized = normalizeUser(authUser);
    await SecureStore.setItemAsync('auth_token', authToken);
    await AsyncStorage.setItem('auth_user', JSON.stringify(normalized));
    setToken(authToken);
    setUser(normalized);
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const response = await authApi.register(name, email, phone, password);
    const { token: authToken, user: authUser } = response.data.data;
    const normalized = normalizeUser(authUser);
    await SecureStore.setItemAsync('auth_token', authToken);
    await AsyncStorage.setItem('auth_user', JSON.stringify(normalized));
    setToken(authToken);
    setUser(normalized);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await AsyncStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
