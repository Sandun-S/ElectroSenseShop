import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // <-- Import Link
import { db } from '/src/firebaseConfig.js'; // <-- Root-relative path
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useCurrentUser } from '/src/hooks/useCurrentUser.js'; // <-- Root-relative path

export default function MyAccountPage() {
  const { user } = useCurrentUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        try {
          setLoading(true);
          setError(null);
          const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
          const querySnapshot = await getDocs(q);
          setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
          console.error("Error fetching orders: ", err);
          setError(err.message); // Set the error
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [user]);
  
  if (!user) {
    return (
      <div className="text-center">
        <p>Please <Link to="/auth" className="text-teal-600 underline">login</Link> to see your account.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Account</h1>
      <p className="text-xl text-gray-700 mb-8">Welcome back, <span className="font-semibold">{user.displayName || user.email}</span>!</p>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">My Order History</h2>
        {loading && <p>Loading orders...</p>}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <p>You haven't placed any orders yet.</p>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map(order => (
              // --- UPDATE: Wrap in a Link component ---
              <Link 
                to={`/order/${order.id}`} // <-- Link to order detail page
                key={order.id} 
                className="block border p-4 rounded-md hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                    <p className="text-lg font-semibold">Total: LKR {order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(order.createdAt?.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

