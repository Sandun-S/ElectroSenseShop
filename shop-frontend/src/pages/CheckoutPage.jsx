import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../firebaseConfig.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useCartStore } from '../store.js';
import { useCurrentUser } from '../hooks/useCurrentUser.js';

export default function CheckoutPage() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.cart);
  // --- FIX: Calculate totalPrice reactively from the cart state ---
  const totalPrice = useCartStore((state) =>
    state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [formData, setFormData] = useState({ name: '', address: '', phone: '' });
  const [loading, setLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/checkout'); 
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user || cart.length === 0) return;

    setLoading(true);
    try {
      // 1. Create the order document
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userName: formData.name,
        userEmail: user.email,
        address: formData.address,
        phone: formData.phone,
        items: cart,
        total: totalPrice + 500, // Include shipping
        status: "Pending",
        createdAt: serverTimestamp()
      });
      
      // 2. Clear the cart
      clearCart();

      // 3. Redirect to success page
      navigate('/order-success');

    } catch (error) {
      console.error("Error placing order: ", error);
      // Use a modal here eventually
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-10">
      <p>Please <Link to="/auth?redirect=/checkout" className="text-teal-600 underline">login</Link> to proceed.</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
        <form onSubmit={handlePlaceOrder} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="name" id="name" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500" />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Shipping Address</label>
            <textarea name="address" id="address" rows="3" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"></textarea>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input type="tel" name="phone" id="phone" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500" />
          </div>
          
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Payment</h2>
            <p className="text-gray-600 bg-yellow-50 p-4 rounded-md">
              This is a **Bank Transfer** order. After placing the order, please transfer the total amount to the bank account details shown on the next page.
            </p>
          </div>

          <button type="submit" disabled={loading || cart.length === 0} className="w-full bg-teal-600 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-teal-700 transition disabled:bg-gray-400">
            {loading ? 'Placing Order...' : `Place Order (LKR ${(totalPrice + 500).toFixed(2)})`}
          </button>
        </form>
      </div>
    </div>
  );
}

