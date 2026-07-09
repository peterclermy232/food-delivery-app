export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio?: string;
  avatarUrl?: string;
  role: 'customer' | 'seller' | 'rider' | 'admin';
  balance?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  startingPrice?: number;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image?: string;
  rating: number;
  deliveryFee: number | 'Free';
  deliveryTime: number;
  categories: string[];
  address: string;
  isOpen: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  icon: string;
  isAllergen?: boolean;
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  rating: number;
  reviewCount?: number;
  ingredients: Ingredient[];
  sizes: string[];
  availableForDelivery: boolean;
  availableForPickup: boolean;
  mealTime?: 'Breakfast' | 'Lunch' | 'Dinner' | 'All';
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  size: string;
}

export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  fullAddress: string;
  street: string;
  postCode: string;
  apartment?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurantName: string;
  restaurantImage?: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'picked_up' | 'delivered' | 'cancelled' | 'completed';
  type: 'Food' | 'Drink';
  createdAt: string;
  deliveryAddress: Address;
  courier?: {
    name: string;
    avatar?: string;
  };
}

export interface Notification {
  id: string;
  userName: string;
  userAvatar?: string;
  action: string;
  timestamp: string;
  thumbnail?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderName: string;
  senderAvatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  senderAvatar?: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  date: string;
  title: string;
  rating: number;
  text: string;
}

export interface PaymentCard {
  id: string;
  holderName: string;
  lastFour: string;
  brand: 'mastercard' | 'visa';
  expiryDate: string;
}
