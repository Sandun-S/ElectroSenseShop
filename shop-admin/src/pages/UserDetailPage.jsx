import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// --- FIX: Use absolute /src path ---
import { db } from '/src/firebaseConfig.js'; 
import { collection, doc, getDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';

export default function UserDetailPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Fetch User Details
    const userRef = doc(db, 'users', userId);
    getDoc(userRef).then((docSnap) => {
      if (docSnap.exists()) {
        setUser({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.error("No such user found!");
      }
    });

    // Fetch User's Orders
    const q = query(
      collection(db, 'orders'), 
      where('userId', '==', userId), 
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error listening to orders: ", error);
      setLoading(false);
    });

    return () => unsubscribe(); 
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Link to="/users" className="text-teal-600 hover:underline mb-4 inline-block">&larr; Back to User Management</Link>
      
      {user && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {user.email || user.id}
          </h1>
          <p className="text-gray-600 capitalize">
            Role: <span className="font-semibold">{user.role || 'customer'}</span>
          </p>
        </div>
      )}

      <h2 className="text-xl font-bold text-gray-800 mb-4">Orders</h2>
      {/* This is a simplified order list. You can reuse the one from DashboardPage.jsx for more detail */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map(order => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {/* This links to the order detail page you already built */}
                  <Link 
                    to={`/orders/${order.id}`} 
                    className="text-teal-600 hover:text-teal-900 hover:underline"
                    title={order.id}
                  >
                    {order.id.substring(0, 8)}...
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleString() : 'No date'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  LKR {order.total ? order.total.toFixed(2) : '0.00'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && !loading && (
        <p className="text-gray-500 mt-4">This user has no orders.</p>
      )}
    </div>
  );
}

