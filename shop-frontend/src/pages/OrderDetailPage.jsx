import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '/src/firebaseConfig.js'; // <-- Root-relative path
import { doc, getDoc } from 'firebase/firestore';
import { useCurrentUser } from '/src/hooks/useCurrentUser.js'; // <-- Root-relative path

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const { user } = useCurrentUser();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && orderId) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          setError(null);
          const docRef = doc(db, 'orders', orderId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const orderData = docSnap.data();
            // Security check: Make sure the logged-in user owns this order
            if (orderData.userId === user.uid) {
              setOrder({ id: docSnap.id, ...orderData });
            } else {
              setError("You do not have permission to view this order.");
            }
          } else {
            setError("Order not found.");
          }
        } catch (err) {
          console.error("Error fetching order: ", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [user, orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }
  
  if (!order) {
    return <p>Order not found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/my-account" className="text-teal-600 hover:underline mb-4 inline-block">&larr; Back to My Account</Link>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-500">Order ID: {order.id}</p>
            <p className="text-gray-500">Date: {new Date(order.createdAt?.toDate()).toLocaleString()}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-lg font-semibold ${
            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
            order.status === 'Completed' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Shipping Address</h2>
            <p className="text-gray-700">{order.userName}</p>
            <p className="text-gray-700">{order.address}</p>
            <p className="text-gray-700">{order.phone}</p>
            <p className="text-gray-700">{order.userEmail}</p>

            <div className="mt-4 bg-teal-50 p-4 rounded-lg">
              <h3 className="font-semibold text-teal-900">Payment Instructions</h3>
              <p className="text-sm text-teal-800">Please use your Order ID <strong className="font-mono">{order.id}</strong> as the reference for your bank transfer.</p>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
            <p className="text-gray-700 flex justify-between">
              <span>Subtotal:</span>
              <span>LKR {(order.total - 500).toFixed(2)}</span>
            </p>
            <p className="text-gray-700 flex justify-between">
              <span>Shipping:</span>
              <span>LKR 500.00</span>
            </p>
            <p className="text-2xl font-bold text-gray-900 flex justify-between mt-2 border-t pt-2">
              <span>Total:</span>
              <span>LKR {order.total.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center">
                  <img 
                    src={item.imageUrl || 'https://placehold.co/100x100/eeeeee/333333?text=Item'} 
                    alt={item.name} 
                    className="w-16 h-16 rounded-md object-cover mr-4"
                  />
                  <div>
                    <p className="text-lg font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-lg font-semibold">LKR {(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

