 import React, { useState, useEffect } from 'react';
 import { db } from '../firebaseConfig.js';
 import { 
collection, doc, onSnapshot, updateDoc, 
query, orderBy, runTransaction, getDoc 
} from 'firebase/firestore';

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    // onSnapshot listens for real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error listening to orders: ", error);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  // --- THIS IS THE NEW, UPDATED FUNCTION ---
  const handleStatusChange = async (order, newStatus) => {
    const orderRef = doc(db, 'orders', order.id);
    
    // Check the current state
    const stockAlreadyUpdated = order.stockUpdated === true;
    const isNowReserving = (newStatus === 'Processing' || newStatus === 'Shipped' || newStatus === 'Completed');
    const isNowCancelling = newStatus === 'Cancelled';

    try {
      if (isNowReserving && !stockAlreadyUpdated) {
        // --- ACTION: RESERVE STOCK ---
        // Moving to a "processed" state for the first time.
        // We MUST use a transaction to safely update stock.
        await runTransaction(db, async (transaction) => {
          const productRefs = [];
          
          // 1. Read all the products in the order
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

          // 2. If all products are fine, update everything
          for (const p of productRefs) {
            transaction.update(p.ref, { stockQuantity: p.newStock });
          }
          
          // 3. Update the order status and add our new flag
          transaction.update(orderRef, { 
            status: newStatus,
            stockUpdated: true 
          });
        });
        
        console.log("Successfully reserved stock and updated order!");
        
      } else if (isNowCancelling && stockAlreadyUpdated) {
        // --- ACTION: REVERT STOCK ---
        // This order was processed, and now we're cancelling.
        // We must add the stock back.
        await runTransaction(db, async (transaction) => {
          // 1. Read all products and add stock back
          for (const item of order.items) {
            const productRef = doc(db, 'products', item.id);
            const productDoc = await transaction.get(productRef);

            if (productDoc.exists()) {
              const newStock = productDoc.data().stockQuantity + item.quantity;
              transaction.update(productRef, { stockQuantity: newStock });
            }
            // If product doesn't exist, we can't add stock back, but we can still cancel.
          }
          
          // 2. Update the order status and revert our flag
          transaction.update(orderRef, { 
            status: newStatus,
            stockUpdated: false 
          });
        });

        console.log("Successfully cancelled order and reverted stock!");

      } else {
        // --- ACTION: JUST UPDATE STATUS ---
        // This is a simple status change with no stock implications
        // (e.g., Pending -> Cancelled, or Shipped -> Completed)
        await updateDoc(orderRef, { status: newStatus });
      }

    } catch (error) {
      console.error("Transaction failed: ", error);
      alert("Error updating status: " + error.message);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Order Management</h1>
      
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.userName}</div>
                    <div className="text-sm text-gray-500">{order.userEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt?.toDate()).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    LKR {order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select 
                      value={order.status} 
                      // --- Pass the *entire order object* to the handler ---
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}