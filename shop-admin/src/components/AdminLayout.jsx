import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
// --- FIX: Use root-relative paths ---
import { auth } from '/src/firebaseConfig.js';
import { signOut } from 'firebase/auth';
import { InboxStackIcon, CreditCardIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
// --- FIX: Use root-relative paths ---
import DashboardPage from '/src/pages/DashboardPage.jsx';
import InventoryPage from '/src/pages/InventoryPage.jsx';

export default function AdminLayout() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-teal-800 text-teal-50 flex flex-col">
        <div className="h-16 flex items-center justify-center text-2xl font-bold">
          ElectroSense
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          <Link to="/" className="flex items-center px-4 py-2 rounded-md hover:bg-teal-700">
            <CreditCardIcon className="h-5 w-5 mr-3" />
            Orders
          </Link>
          <Link to="/inventory" className="flex items-center px-4 py-2 rounded-md hover:bg-teal-700">
            <InboxStackIcon className="h-5 w-5 mr-3" />
            Inventory
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex justify-end items-center px-6">
          <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-teal-600">
            <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-1" />
            Logout
          </button>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

