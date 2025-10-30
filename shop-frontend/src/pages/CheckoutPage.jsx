import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Removed 'doc' and 'updateDoc'
import { useCartStore } from '../store.js';
import { useCurrentUser } from '../hooks/useCurrentUser.js';

export default function CheckoutPage() {
  const { user, authLoading } = useCurrentUser();
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);
  
  // Calculate total price reactively
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 500; // Example shipping fee
  const totalWithShipping = totalPrice + shippingFee;

  const [formData, setFormData] = useState({ name: '', address: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // State for user-facing errors

  useEffect(() => {
    // Wait for auth to be ready
    if (!authLoading) {
      if (!user) {
        // Redirect to login and tell it where to come back
        navigate('/auth', { state: { from: { pathname: '/checkout' } }, replace: true });
      } else {
        // Pre-fill form if user has a name
        setFormData(prev => ({
          ...prev,
          name: user.displayName || '',
        }));
      }
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user || cart.length === 0) return;

    setLoading(true);
    setError(''); // Clear previous errors
    try {
      // 1. Create the order document
      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userName: formData.name,
        userEmail: user.email,
        address: formData.address,
        phone: formData.phone,
        items: cart,
        total: totalWithShipping,
        status: "Pending",
        createdAt: serverTimestamp()
      });

      // --- FIX: Removed the stock update logic that caused the permission error ---
      // The admin will update stock when processing the order.
      
      // 2. Clear the cart
      clearCart();

      // 3. Redirect to success page, passing the new order ID
      navigate('/order-success', { state: { orderId: orderRef.id } });

    } catch (error) {
      console.error("Error placing order: ", error);
      setError("Failed to place order. Please try again."); // Show a user-friendly error
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
        <form onSubmit={handlePlaceOrder} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input 
              type="text" 
              name="name" 
              id="name" 
              value={formData.name}
              required 
              onChange={handleChange} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500" 
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Shipping Address</label>
            <textarea 
              name="address" 
              id="address" 
              rows="3" 
              value={formData.address}
              required 
              onChange={handleChange} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            ></textarea>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              id="phone" 
              value={formData.phone}
              required 
              onChange={handleChange} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500" 
            />
          </div>
          
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Payment</h2>
            <p className="text-gray-600 bg-yellow-50 p-4 rounded-md">
              This is a **Bank Transfer** order. After placing the order, please transfer the total amount to the bank account details shown on the next page.
            </p>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || cart.length === 0} 
            className="w-full bg-teal-600 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-teal-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Placing Order...' : `Place Order (LKR ${totalWithShipping.toFixed(2)})`}
          </button>
        </form>
      </div>
    </div>
  );
}

