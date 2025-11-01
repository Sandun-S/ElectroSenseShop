import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Import db using the absolute path
import { db } from '../firebaseConfig.js'; 
import { 
  collection, doc, onSnapshot, updateDoc, 
  query, orderBy, runTransaction,
  where // <-- 1. IMPORT 'where'
} from 'firebase/firestore';

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Make sure db is initialized before querying
    if (!db) {
      setLoading(false);
      return;
    }
    
    // --- 2. THE NEW, SCALABLE QUERY ---
    // This query fetches all orders NOT 'Completed' or 'Cancelled',
    // and then orders them by the newest first.
    const q = query(
      collection(db, 'orders'), 
      where('status', 'not-in', ['Completed', 'Cancelled']),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error listening to orders: ", error);
      // This is where the index error will appear
      console.error("If you see a 'permission-denied' or 'failed-precondition' error, you likely need to create a Firestore index. See the console error message for a link to create it.");
      setLoading(false);
    });

    return () => unsubscribe(); 
  }, []); // db is not in dependency array as it's stable after init

  const handleStatusChange = async (order, newStatus) => {
    // ... (This entire function remains unchanged, no need to copy)
    if (!db) {
        console.error("Firestore (db) is not initialized.");
        return;
    }
    const orderRef = doc(db, 'orders', order.id);
    
    const stockAlreadyUpdated = order.stockUpdated === true;
    const isNowReserving = (newStatus === 'Processing' || newStatus === 'Shipped' || newStatus === 'Completed');
    const isNowCancelling = newStatus === 'Cancelled';

    try {
      if (isNowReserving && !stockAlreadyUpdated) {
        // --- ACTION: RESERVE STOCK ---
        await runTransaction(db, async (transaction) => {
          const productRefs = [];
          
          for (const item of order.items) {
            const productRef = doc(db, 'products', item.id);
            const productDoc = await transaction.get(productRef);

            if (!productDoc.exists()) {
              throw new Error(`Product ${item.name} (ID: ${item.id}) not found!`);
            }

            const newStock = productDoc.data().stockQuantity - item.quantity;
            if (newStock < 0) {
              throw new Error(`Not enough stock for ${item.name}! Cannot complete order.`);
            }
            
            productRefs.push({ ref: productRef, newStock: newStock });
          }

          for (const p of productRefs) {
            transaction.update(p.ref, { stockQuantity: p.newStock });
          }
          
          transaction.update(orderRef, { 
            status: newStatus,
            stockUpdated: true 
          });
        });
        
        console.log("Successfully reserved stock and updated order!");
        
      } else if (isNowCancelling && stockAlreadyUpdated) {
        // --- ACTION: REVERT STOCK (FIXED LOGIC) ---
        await runTransaction(db, async (transaction) => {
          
          // --- 1. READ ALL PRODUCT DOCS FIRST ---
          const productUpdates = []; // To store our planned updates
          for (const item of order.items) {
            const productRef = doc(db, 'products', item.id);
            const productDoc = await transaction.get(productRef); // <-- READ

            if (productDoc.exists()) {
              const newStock = productDoc.data().stockQuantity + item.quantity;
              // Store the ref and the new value to update later
              productUpdates.push({ ref: productRef, newStock: newStock });
            }
            // If productDoc doesn't exist, we just skip it.
          }
          
          // --- 2. NOW, PERFORM ALL WRITES ---
          for (const update of productUpdates) {
            transaction.update(update.ref, { stockQuantity: update.newStock }); // <-- WRITE
          }
          
          // --- 3. FINALLY, UPDATE THE ORDER ---
          transaction.update(orderRef, { // <-- WRITE
            status: newStatus,
            stockUpdated: false 
          });
        });

        console.log("Successfully cancelled order and reverted stock!");

      } else {
        // --- ACTION: JUST UPDATE STATUS ---
        await updateDoc(orderRef, { status: newStatus });
      }

    } catch (error) {
      console.error("Transaction failed: ", error);
      // Use console.error instead of alert
      console.error("Error updating status: " + error.message); 
    }
  };

  return (
    <div>
      {/* --- 3. RENAMED TITLE --- */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Active Orders</h1>
      
      {loading ? (
        <p>Loading active orders...</p>
      ) : !db ? (
         <p className="text-red-500">Firestore is not initialized. Please check configuration.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* --- 4. ADDED CHECK FOR EMPTY ORDERS --- */}
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No active orders found. (All 'Pending', 'Processing', and 'Shipped' orders will appear here.)
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        to={`/orders/${order.id}`} 
                        className="text-teal-600 hover:text-teal-900 hover:underline"
                        title={order.id}
                      >
                        {order.id.substring(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.userName}</div>
                      <div className="text-sm text-gray-500">{order.userEmail}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order, e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                      >
                        <option>Pending</option>
                        <option>Processing</option>
                        <option>Shipped</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

