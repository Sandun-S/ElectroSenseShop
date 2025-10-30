import React from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store.js';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
  const cart = useCartStore((state) => state.cart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  // --- FIX: Calculate totalPrice reactively from the cart state ---
  const totalPrice = useCartStore((state) =>
    state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="bg-teal-600 text-white font-bold py-3 px-6 rounded-md hover:bg-teal-700 transition">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Cart</h1>
          <div className="space-y-6">
            {cart.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between border-b pb-6">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <img 
                    src={item.imageUrl || 'https://placehold.co/100x100/0d9488/white?text=Item'} 
                    alt={item.name}
                    className="w-20 h-20 rounded-md object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    <p className="text-gray-600">LKR {item.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    value={item.quantity}
                    min="0" // Allow 0 to remove
                    onChange={(e) => updateQuantity(item.id, e.target.value)}
                    className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                  />
                  <p className="text-lg font-semibold w-24 text-right">
                    LKR {(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <aside className="bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-4">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">LKR {totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-semibold">LKR 500.00</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-4">
              <span>Total</span>
              <span className="text-teal-600">LKR {(totalPrice + 500).toFixed(2)}</span>
            </div>
          </div>
          <Link to="/checkout" className="mt-6 w-full bg-teal-600 text-white py-3 px-6 rounded-md text-lg font-semibold text-center block hover:bg-teal-700 transition">
            Proceed to Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}

