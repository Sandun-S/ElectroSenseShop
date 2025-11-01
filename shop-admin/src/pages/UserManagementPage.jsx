import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
// --- FIX: Use root-relative path, consistent with other pages ---
import { db } from '/src/firebaseConfig.js'; 
import { 
  collection, onSnapshot, doc, updateDoc, query, where, orderBy 
} from 'firebase/firestore';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false); // Only load when searching
  
  // --- NEW: State for search ---
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  // --- NEW: Store the unsubscribe function in a ref ---
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    // This effect now depends on 'activeSearch'.
    
    // 1. If there's an old listener, unsubscribe from it.
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    // 2. If the search is empty, show no users and don't query.
    if (activeSearch === '') {
      setUsers([]);
      setLoading(false);
      return;
    }

    // 3. We have a search term, so build the query.
    setLoading(true);
    const q = query(
      collection(db, 'users'),
      orderBy('email'),
      where('email', '>=', activeSearch),
      where('email', '<=', activeSearch + '\uf8ff') // \uf8ff is a "high" character
    );

    // 4. Create the new real-time listener and store it.
    unsubscribeRef.current = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Error fetching users:", err);
      setLoading(false);
    });

    // 5. Return a cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [activeSearch]); // Re-run when the *active* search changes

  const handleRoleChange = async (userId, newRole) => {
    const userRef = doc(db, 'users', userId);
    try {
      await updateDoc(userRef, {
        role: newRole,
        isAdmin: newRole === 'admin'
      });
    } catch (error) {
      console.error("Error updating role: ", error);
    }
  };

  // --- NEW: Handle search form submission ---
  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearch(searchTerm);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">User Management</h1>
      
      {/* --- NEW: Search Form --- */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            // --- FIX: Corrected typo 'e.targe' to 'e.target' ---
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email..."
            className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          />
          <button
            type="submit"
            className="bg-teal-600 text-white py-2 px-6 rounded-md font-semibold hover:bg-teal-700 transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* User List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-numeric text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                    {activeSearch === '' ? 'Please enter a search term to find users.' : 'No users found for this search.'}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.email || 'No email provided'}
                    </td>
                    {/* --- FIX: Corrected typo 'nowsection' to 'nowrap' --- */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select 
                        value={user.role || 'customer'} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        // Simple disable logic for your own admin account
                        disabled={user.email === 'siwanthasandun14933@gmail.com'} 
                      >
                        <option value="customer">Customer</option>
                        <option value="cashier">Cashier</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link 
                        to={`/users/${user.id}`} 
                        className="text-teal-600 hover:text-teal-900 hover:underline"
                      >
                        {/* --- FIX: Corrected broken Link tag --- */}
                        View Orders
                      </Link>
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

