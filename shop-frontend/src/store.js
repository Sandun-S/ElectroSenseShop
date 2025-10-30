import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// --- Zustand Cart Store ---
// This manages your shopping cart and saves it to local storage
export const useCartStore = create(
  persist(
    (set) => ({
      cart: [], // The array of cart items

      // Add an item to the cart or increment its quantity
      addToCart: (product) => set((state) => {
        const existingItem = state.cart.find((item) => item.id === product.id);
        let newCart;
        if (existingItem) {
          // Increment quantity
          newCart = state.cart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          // Add new item
          newCart = [...state.cart, { ...product, quantity: 1 }];
        }
        return { cart: newCart };
      }),

      // Update the quantity of a specific item
      updateQuantity: (productId, quantity) => set((state) => {
        const newQuantity = Math.max(0, parseInt(quantity, 10) || 0);
        let newCart;
        if (newQuantity === 0) {
          // Remove item if quantity is 0
          newCart = state.cart.filter((item) => item.id !== productId);
        } else {
          newCart = state.cart.map((item) =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
          );
        }
        return { cart: newCart };
      }),

      // Remove an item completely from the cart
      removeFromCart: (productId) => set((state) => {
        const newCart = state.cart.filter((item) => item.id !== productId);
        return { cart: newCart };
      }),

      // Clear the entire cart (e.g., after checkout)
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'electro-cart-storage', // Key for local storage
      storage: createJSONStorage(() => localStorage), // Use local storage
    }
  )
);

