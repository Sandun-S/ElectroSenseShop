import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// --- FIX: Use relative path from 'pages' folder ---
import { db } from '../firebaseConfig.js';
import { 
  doc, onSnapshot, updateDoc, 
  runTransaction, getDoc
} from 'firebase/firestore';

export default function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided.");
      setLoading(false);
      return;
    }
    
    const docRef = doc(db, 'orders', orderId);
    
    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const orderData = docSnap.data();
        // --- ADMIN PAGE: NO security check needed ---
        setOrder({ id: docSnap.id, ...orderData });
        setError(null);
      } else {
        setError("Order not found.");
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching order: ", err);
      setError(err.message);
      setLoading(false);
    });

    // Clean up the listener
    return () => unsubscribe();
    
  }, [orderId]);

  // --- COPIED FROM DASHBOARD: Logic to handle status change ---
  const handleStatusChange = async (order, newStatus) => {
    // Prevent changing if status is already set
    if (order.status === newStatus) return;

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
            if (!productDoc.exists()) throw new Error(`Product ${item.name} not found!`);
            const newStock = productDoc.data().stockQuantity - item.quantity;
            if (newStock < 0) throw new Error(`Not enough stock for ${item.name}!`);
            productRefs.push({ ref: productRef, newStock: newStock });
          }
          for (const p of productRefs) {
            transaction.update(p.ref, { stockQuantity: p.newStock });
          }
          transaction.update(orderRef, { status: newStatus, stockUpdated: true });
        });
        console.log("Successfully reserved stock and updated order!");
        
      } else if (isNowCancelling && stockAlreadyUpdated) {
        // --- ACTION: REVERT STOCK ---
        await runTransaction(db, async (transaction) => {
          for (const item of order.items) {
            const productRef = doc(db, 'products', item.id);
            const productDoc = await transaction.get(productRef);
            if (productDoc.exists()) {
              const newStock = productDoc.data().stockQuantity + item.quantity;
              transaction.update(productRef, { stockQuantity: newStock });
            }
          }
          transaction.update(orderRef, { status: newStatus, stockUpdated: false });
        });
        console.log("Successfully cancelled order and reverted stock!");

      } else {
        // --- ACTION: JUST UPDATE STATUS ---
        await updateDoc(orderRef, { status: newStatus });
      }

    } catch (error) {
      console.error("Transaction failed: ", error);
      console.error("Error updating status: " + error.message); 
    }
  };
  // --- END of status logic ---


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
      {/* --- ADMIN PAGE: Link back to dashboard --- */}
      <Link to="/" className="text-teal-600 hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-500 font-mono text-xs">Order ID: {order.id}</p>
            {/* --- FIX: Check for toDate method --- */}
            <p className="text-gray-500">Date: {order.createdAt?.toDate() ? new Date(order.createdAt.toDate()).toLocaleString() : 'No date'}</p>
          </div>

          {/* --- ADMIN PAGE: Add status change dropdown --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
            <select 
              value={order.status} 
              onChange={(e) => handleStatusChange(order, e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-lg font-semibold"
            >
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>
          
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
              {/* Note: This assumes a flat 500 shipping rate. Adjust if needed. */}
              {/* --- FIX: Check for total existence --- */}
              <span>LKR {(order.total ? (order.total - 500) : 0).toFixed(2)}</span>
            </p>
            <p className="text-gray-700 flex justify-between">
              <span>Shipping:</span>
              <span>LKR 500.00</span>
            </p>
            <p className="text-2xl font-bold text-gray-900 flex justify-between mt-2 border-t pt-2">
              <span>Total:</span>
              {/* --- FIX: Check for total existence --- */}
              <span>LKR {order.total ? order.total.toFixed(2) : '0.00'}</span>
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

