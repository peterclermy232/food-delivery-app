import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      SecureStore.deleteItemAsync('auth_token');
      AsyncStorage.removeItem('auth_user');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, phone: string, password: string) =>
    api.post('/auth/register', { name, email, phone, password }),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  verifyOtp: (email: string, otp: string) =>
    api.post('/auth/verify-otp', { email, otp }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

export const restaurantApi = {
  getAll: (params?: { category?: string; search?: string }) =>
    api.get('/restaurants', { params }),
  getById: (id: string) => api.get(`/restaurants/${id}`),
  search: (query: string) => api.get('/restaurants/search', { params: { q: query } }),
};

export const foodApi = {
  getByRestaurant: (restaurantId: string, category?: string) =>
    api.get(`/restaurants/${restaurantId}/foods`, { params: { category } }),
  getById: (id: string) => api.get(`/foods/${id}`),
  search: (query: string) => api.get('/foods/search', { params: { q: query } }),
};

export const orderApi = {
  place: (data: {
    items: { foodItemId: string; quantity: number; size: string }[];
    restaurantId: string;
    deliveryAddress: string;
    paymentMethod?: string;
  }) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  track: (id: string) => api.get(`/orders/${id}/track`),
  cancel: (id: string) => api.put(`/orders/${id}/cancel`),
  rate: (orderId: string, rating: number, comment: string) =>
    api.put(`/orders/${orderId}/rate`, { rating, comment }),
};

export const profileApi = {
  get: () => api.get('/profile'),
  update: (data: Partial<{ name: string; email: string; phone: string; bio: string }>) =>
    api.put('/profile', data),
  uploadAvatar: (formData: FormData) =>
    api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const addressApi = {
  getAll: () => api.get('/addresses'),
  create: (data: {
    label: string;
    fullAddress: string;
    street: string;
    postCode: string;
    apartment?: string;
  }) => api.post('/addresses', data),
  update: (id: string, data: object) => api.put(`/addresses/${id}`, data),
  delete: (id: string) => api.delete(`/addresses/${id}`),
};

export const paymentApi = {
  getCards: () => api.get('/payment/cards'),
  addCard: (data: {
    holderName: string;
    cardNumber: string;
    expiryDate: string;
    cvc: string;
  }) => api.post('/payment/cards', data),
  deleteCard: (id: string) => api.delete(`/payment/cards/${id}`),
};

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
};

export const messageApi = {
  getConversations: () => api.get('/messages'),
  getMessages: (conversationId: string) => api.get(`/messages/${conversationId}`),
  send: (conversationId: string, text: string) =>
    api.post(`/messages/${conversationId}`, { text }),
};

export const categoryApi = {
  getAll: () => api.get('/categories'),
};

export const uploadApi = {
  image: (formData: FormData) =>
    api.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const reviewApi = {
  getByRestaurant: (restaurantId: string) => api.get(`/restaurants/${restaurantId}/reviews`),
  getByFood: (foodId: string) => api.get(`/foods/${foodId}/reviews`),
};

export const sellerApi = {
  getDashboard: () => api.get('/seller/dashboard'),
  getFoods: (restaurantId?: string) => api.get('/seller/foods', { params: restaurantId ? { restaurantId } : {} }),
  createFood: (data: object) => api.post('/seller/foods', data),
  updateFood: (id: string, data: object) => api.put(`/seller/foods/${id}`, data),
  deleteFood: (id: string) => api.delete(`/seller/foods/${id}`),
  getRestaurants: () => api.get('/seller/restaurants'),
  createRestaurant: (data: object) => api.post('/seller/restaurants', data),
  updateRestaurant: (id: string, data: object) => api.put(`/seller/restaurants/${id}`, data),
  getOrders: () => api.get('/seller/orders'),
  completeOrder: (id: string) => api.put(`/seller/orders/${id}/complete`),
  updateOrderStatus: (id: string, status: string) =>
    api.put(`/seller/orders/${id}/status`, { status }),
  cancelOrder: (id: string) => api.put(`/seller/orders/${id}/cancel`),
  withdraw: (amount: number) => api.post('/seller/withdraw', { amount }),
};

export const riderApi = {
  getOrders: () => api.get('/rider/orders'),
  pickup: (id: string) => api.put(`/rider/orders/${id}/pickup`),
  deliver: (id: string) => api.put(`/rider/orders/${id}/deliver`),
  updateLocation: (latitude: number, longitude: number) =>
    api.put('/rider/location', { latitude, longitude }),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (role?: string) => api.get('/admin/users', { params: role ? { role } : {} }),
  createUser: (data: { name: string; email: string; phone: string; role: string; password: string }) =>
    api.post('/admin/users', data),
  updateUser: (id: string, data: object) => api.put(`/admin/users/${id}`, data),
  enableUser: (id: string) => api.put(`/admin/users/${id}/enable`),
  disableUser: (id: string) => api.put(`/admin/users/${id}/disable`),
};

export const caseApi = {
  raise: (orderId: string, subject: string, description: string) =>
    api.post('/cases', { orderId, subject, description }),
  getForOrder: (orderId: string) => api.get(`/cases/order/${orderId}`),
  getMyCases: () => api.get('/cases/my'),
  getSellerCases: () => api.get('/seller/cases'),
  replyToCase: (caseId: string, message: string) =>
    api.put(`/seller/cases/${caseId}/reply`, { message }),
};

export default api;
