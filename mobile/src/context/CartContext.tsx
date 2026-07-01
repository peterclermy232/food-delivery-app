import React, { createContext, useContext, useState } from 'react';
import { CartItem, FoodItem } from '../types';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  deliveryAddress: string;
  addItem: (foodItem: FoodItem, quantity: number, size: string) => void;
  removeItem: (foodItemId: string) => void;
  updateQuantity: (foodItemId: string, quantity: number) => void;
  clearCart: () => void;
  setDeliveryAddress: (address: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState('2118 Thornridge Cir. Syracuse');

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0);

  const addItem = (foodItem: FoodItem, quantity: number, size: string) => {
    setItems(prev => {
      const existing = prev.find(i => i.foodItem.id === foodItem.id && i.size === size);
      if (existing) {
        return prev.map(i =>
          i.foodItem.id === foodItem.id && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { foodItem, quantity, size }];
    });
  };

  const removeItem = (foodItemId: string) => {
    setItems(prev => prev.filter(i => i.foodItem.id !== foodItemId));
  };

  const updateQuantity = (foodItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(foodItemId);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.foodItem.id === foodItemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{
      items, totalItems, totalPrice, deliveryAddress,
      addItem, removeItem, updateQuantity, clearCart, setDeliveryAddress,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
