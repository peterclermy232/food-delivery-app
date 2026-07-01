import { Restaurant, FoodItem, Category, Notification, Message, ChatMessage, Order, Review, PaymentCard, Address } from '../types';

export const mockCategories: Category[] = [
  { id: '1', name: 'All', icon: 'grid', startingPrice: 0 },
  { id: '2', name: 'Hot Dog', icon: 'hotdog', startingPrice: 20 },
  { id: '3', name: 'Burger', icon: 'burger', startingPrice: 50 },
  { id: '4', name: 'Pizza', icon: 'pizza', startingPrice: 70 },
  { id: '5', name: 'Sandwich', icon: 'sandwich', startingPrice: 30 },
  { id: '6', name: 'Noodles', icon: 'noodles', startingPrice: 25 },
];

export const mockRestaurants: Restaurant[] = [
  {
    id: '1', name: 'Rose Garden Restaurant',
    description: 'Maecenas sed diam eget risus varius blandit sit amet non magna.',
    rating: 4.7, deliveryFee: 'Free', deliveryTime: 20,
    categories: ['Burger', 'Chicken', 'Riche', 'Wings'],
    address: 'Kentucky 39495', isOpen: true,
  },
  {
    id: '2', name: 'Spicy Restaurant',
    description: 'Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
    rating: 4.7, deliveryFee: 'Free', deliveryTime: 20,
    categories: ['Burger', 'Sandwich', 'Pizza'],
    address: 'Texas 12345', isOpen: true,
  },
  {
    id: '3', name: 'Uttora Coffee House',
    description: 'Coffee and light meals in a cozy atmosphere.',
    rating: 4.5, deliveryFee: 'Free', deliveryTime: 15,
    categories: ['Coffee', 'Breakfast', 'Sandwiches'],
    address: 'California 90210', isOpen: true,
  },
  {
    id: '4', name: 'Tasty Treat Gallery',
    description: 'Desserts and treats for every occasion.',
    rating: 4.7, deliveryFee: 'Free', deliveryTime: 20,
    categories: ['Desserts', 'Cakes', 'Ice Cream'],
    address: 'New York 10001', isOpen: true,
  },
];

const mockIngredients = [
  { id: '1', name: 'Salt', icon: 'salt' },
  { id: '2', name: 'Chicken', icon: 'chicken' },
  { id: '3', name: 'Onion', icon: 'onion', isAllergen: true },
  { id: '4', name: 'Garlic', icon: 'garlic', isAllergen: true },
  { id: '5', name: 'Pappers', icon: 'pepper', isAllergen: true },
  { id: '6', name: 'Ginger', icon: 'ginger' },
  { id: '7', name: 'Avocado', icon: 'avocado' },
  { id: '8', name: 'Apple', icon: 'apple' },
  { id: '9', name: 'Blueberry', icon: 'blueberry' },
  { id: '10', name: 'Broccoli', icon: 'broccoli' },
];

export const mockFoods: FoodItem[] = [
  {
    id: '1', restaurantId: '1', restaurantName: 'Rose Garden Restaurant',
    name: 'Burger Bistro', description: 'Maecenas sed diam eget risus varius blandit sit amet non magna. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
    price: 32, category: 'Burger', rating: 4.7, reviewCount: 10,
    ingredients: mockIngredients.slice(0, 5),
    sizes: ["10\"", "14\"", "16\""],
    availableForDelivery: true, availableForPickup: true, mealTime: 'Breakfast',
  },
  {
    id: '2', restaurantId: '2', restaurantName: 'Spicy Restaurant',
    name: 'Pizza Calzone European', description: 'Prosciutto e funghi is a pizza variety that is topped with tomato sauce.',
    price: 32, category: 'Pizza', rating: 4.7,
    ingredients: mockIngredients.slice(0, 5),
    sizes: ["10\"", "14\"", "16\""],
    availableForDelivery: true, availableForPickup: true, mealTime: 'Lunch',
  },
  {
    id: '3', restaurantId: '1', restaurantName: 'Rose Garden Restaurant',
    name: 'Smokin\' Burger', description: 'Smoky BBQ burger with caramelized onions.',
    price: 60, category: 'Burger', rating: 4.5,
    ingredients: mockIngredients.slice(0, 4),
    sizes: ["10\"", "14\""],
    availableForDelivery: true, availableForPickup: false, mealTime: 'Lunch',
  },
  {
    id: '4', restaurantId: '1', restaurantName: 'Rose Garden Restaurant',
    name: 'Chicken Thai Biriyani', description: 'Aromatic rice dish with tender chicken and Thai spices.',
    price: 60, category: 'Breakfast', rating: 4.9, reviewCount: 10,
    ingredients: mockIngredients.slice(1, 6),
    sizes: ["Regular", "Large"],
    availableForDelivery: false, availableForPickup: true, mealTime: 'Breakfast',
  },
  {
    id: '5', restaurantId: '1', restaurantName: 'Rose Garden Restaurant',
    name: 'Chicken Bhuna', description: 'Rich and flavorful chicken curry.',
    price: 30, category: 'Breakfast', rating: 4.9, reviewCount: 10,
    ingredients: mockIngredients.slice(0, 5),
    sizes: ["Regular", "Large"],
    availableForDelivery: false, availableForPickup: true, mealTime: 'Breakfast',
  },
  {
    id: '6', restaurantId: '1', restaurantName: 'Rose Garden Restaurant',
    name: 'Mazalichiken Halim', description: 'Traditional halim with chicken.',
    price: 25, category: 'Breakfast', rating: 4.9, reviewCount: 10,
    ingredients: mockIngredients.slice(2, 7),
    sizes: ["Regular", "Large"],
    availableForDelivery: false, availableForPickup: true, mealTime: 'Breakfast',
  },
  {
    id: '7', restaurantId: '2', restaurantName: 'Spicy Restaurant',
    name: 'Burger Ferguson', description: 'Classic beef burger with all the trimmings.',
    price: 40, category: 'Burger', rating: 4.5,
    ingredients: mockIngredients.slice(0, 4),
    sizes: ["10\"", "14\"", "16\""],
    availableForDelivery: true, availableForPickup: true, mealTime: 'All',
  },
  {
    id: '8', restaurantId: '2', restaurantName: 'Spicy Restaurant',
    name: 'Rockin\' Burgers', description: 'Rock-solid burgers that never disappoint.',
    price: 40, category: 'Burger', rating: 4.3,
    ingredients: mockIngredients.slice(1, 5),
    sizes: ["10\"", "14\""],
    availableForDelivery: true, availableForPickup: false, mealTime: 'All',
  },
  {
    id: '9', restaurantId: '1', restaurantName: 'Rose Garden Restaurant',
    name: 'Buffalo Burgers', description: 'Spicy buffalo-style burgers.',
    price: 75, category: 'Burger', rating: 4.8,
    ingredients: mockIngredients.slice(0, 6),
    sizes: ["10\"", "14\"", "16\""],
    availableForDelivery: true, availableForPickup: true, mealTime: 'All',
  },
  {
    id: '10', restaurantId: '1', restaurantName: 'Rose Garden Restaurant',
    name: 'Bullseye Burgers', description: 'Right on target every time.',
    price: 94, category: 'Burger', rating: 4.6,
    ingredients: mockIngredients.slice(0, 5),
    sizes: ["10\"", "14\"", "16\""],
    availableForDelivery: true, availableForPickup: true, mealTime: 'All',
  },
];

export const mockNotifications: Notification[] = [
  { id: '1', userName: 'Tanbir Ahmed', action: 'Placed a new order', timestamp: '20 min ago' },
  { id: '2', userName: 'Salim Smith', action: 'left a 5 star review', timestamp: '20 min ago' },
  { id: '3', userName: 'Royal Bengol', action: 'agreed to cancel', timestamp: '20 min ago' },
  { id: '4', userName: 'Pabel Vuiya', action: 'Placed a new order', timestamp: '20 min ago' },
];

export const mockMessages: Message[] = [
  { id: '1', conversationId: 'c1', senderName: 'Royal Parvej', senderAvatar: undefined, lastMessage: 'Sounds awesome!', timestamp: '19:37', unreadCount: 1, isOnline: true },
  { id: '2', conversationId: 'c2', senderName: 'Cameron Williamson', lastMessage: 'Ok, just hurry up little bit...😜', timestamp: '19:37', unreadCount: 2, isOnline: true },
  { id: '3', conversationId: 'c3', senderName: 'Ralph Edwards', lastMessage: 'Thanks dude.', timestamp: '19:37', unreadCount: 0, isOnline: true },
  { id: '4', conversationId: 'c4', senderName: 'Cody Fisher', lastMessage: 'How is going...?', timestamp: '19:37', unreadCount: 0, isOnline: true },
  { id: '5', conversationId: 'c5', senderName: 'Eleanor Pena', lastMessage: 'Thanks for the awesome food man...!', timestamp: '19:37', unreadCount: 0, isOnline: false },
];

export const mockChatMessages: ChatMessage[] = [
  { id: '1', text: 'Are you coming?', timestamp: '8:10 pm', isOwn: true },
  { id: '2', text: 'Hay, Congratulation for order', timestamp: '8:11 pm', isOwn: false },
  { id: '3', text: 'Hey Where are you now?', timestamp: '8:11 pm', isOwn: true },
  { id: '4', text: "I'm Coming , just wait ...", timestamp: '8:12 pm', isOwn: false },
  { id: '5', text: 'Hurry Up, Man', timestamp: '8:12 pm', isOwn: true },
];

export const mockOrders: Order[] = [
  {
    id: '1', orderNumber: '#162432', restaurantName: 'Pizza Hut',
    items: [], total: 35.25, status: 'confirmed', type: 'Food',
    createdAt: '29 JAN, 12:30', deliveryAddress: { id: '1', label: 'Home', fullAddress: '2118 Thornridge Cir. Syracuse', street: 'Thornridge Cir', postCode: '13201', apartment: '2B' },
    courier: { name: 'Robert F.' },
  },
  {
    id: '2', orderNumber: '#242432', restaurantName: 'McDonald',
    items: [], total: 40.15, status: 'confirmed', type: 'Drink',
    createdAt: '30 JAN, 12:30', deliveryAddress: { id: '1', label: 'Home', fullAddress: '2118 Thornridge Cir. Syracuse', street: 'Thornridge Cir', postCode: '13201' },
  },
  {
    id: '3', orderNumber: '#240112', restaurantName: 'Starbucks',
    items: [], total: 10.20, status: 'delivered', type: 'Drink',
    createdAt: '30 JAN, 12:30', deliveryAddress: { id: '1', label: 'Home', fullAddress: '2118 Thornridge Cir. Syracuse', street: 'Thornridge Cir', postCode: '13201' },
  },
];

export const mockAddresses: Address[] = [
  { id: '1', label: 'Home', fullAddress: '2464 Royal Ln. Mesa, New Jersey 45463', street: 'Royal Ln', postCode: '45463', apartment: '' },
  { id: '2', label: 'Work', fullAddress: '3891 Ranchview Dr. Richardson, California 62639', street: 'Ranchview Dr', postCode: '62639', apartment: '' },
];

export const mockCards: PaymentCard[] = [
  { id: '1', holderName: 'Vishal Khadok', lastFour: '436', brand: 'mastercard', expiryDate: '12/26' },
];

export const mockReviews: Review[] = [
  { id: '1', userName: 'User 1', date: '20/12/2020', title: 'Great Food and Service', rating: 5, text: 'This Food so tasty & delicious. Breakfast so fast Delivered in my place. Chef is very friendly. I\'m really like chef for Home Food Order. Thanks.' },
  { id: '2', userName: 'User 2', date: '20/12/2020', title: 'Awesome and Nice', rating: 4, text: 'This Food so tasty & delicious. Breakfast so fast Delivered in my place.' },
  { id: '3', userName: 'User 3', date: '20/12/2020', title: 'Awesome and Nice', rating: 4, text: 'This Food so tasty & delicious.' },
  { id: '4', userName: 'User 4', date: '20/12/2020', title: 'Awesome and Nice', rating: 4, text: 'This Food so tasty & delicious. Breakfast so fast Delivered in my place.' },
];
