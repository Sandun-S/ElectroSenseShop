import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// --- FIX: Use relative paths from App.jsx (which is in src) ---
import { db, auth } from './firebaseConfig.js';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// --- Page & Layout Imports (using relative paths) ---
import LoginPage from './pages/LoginPage.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';


export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          // --- FIX: Check for 'role' instead of 'isAdmin' ---
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
          } else {
            // Not an admin, sign them out
            setIsAdmin(false);
            signOut(auth);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
          signOut(auth);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-teal-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Route 1: The login page.
      */}
      <Route path="/login" element={<LoginPage />} />

      {/* Route 2: All other routes ("/*") are protected.
        We render AdminLayout, which will handle all the 
        nested routes for the admin panel.
      */}
      <Route 
        path="/*" 
        element={
          <ProtectedRoute user={user} isAdmin={isAdmin}>
            <AdminLayout />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

