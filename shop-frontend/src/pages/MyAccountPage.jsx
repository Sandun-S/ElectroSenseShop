import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser.js';
import { db } from '../firebaseConfig.js';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

export default function MyAccountPage() {
  const { user } = useCurrentUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        try {
          setLoading(true);
          const q = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
          const querySnapshot = await getDocs(q);
          setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error("Error fetching orders: ", error);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [user]);
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-10">
        <p>Please <Link to="/auth" className="text-teal-600 underline">login</Link> to see your account.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Account</h1>
        <p className="text-xl text-gray-700 mb-8">Welcome back, <span className="font-semibold">{user.displayName || user.email}</span>!</p>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">My Order History</h2>
          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>You haven't placed any orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border p-4 rounded-md">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                      <p className="text-sm text-gray-500">Order ID: <span className="font-mono">{order.id}</span></p>
                      <p className="text-lg font-semibold">Total: LKR {order.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        Date: {new Date(order.createdAt?.toDate()).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium self-start sm:self-center ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

