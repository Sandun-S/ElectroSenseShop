import React, { lazy, Suspense } from 'react'; // <-- 1. IMPORT LAZY & SUSPENSE
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
// --- FIX: Use root-relative paths for Vite (e.g., /src/...) ---
import { auth } from '/src/firebaseConfig.js';
import { signOut } from 'firebase/auth';
import { 
  InboxStackIcon, 
  CreditCardIcon, 
  ArrowLeftOnRectangleIcon,
  TagIcon,
  UsersIcon // <-- Added new icon
} from '@heroicons/react/24/outline';

// --- 2. CONVERT ALL PAGE IMPORTS TO LAZY IMPORTS (using root-relative paths) ---
const DashboardPage = lazy(() => import('/src/pages/DashboardPage.jsx'));
const InventoryPage = lazy(() => import('/src/pages/InventoryPage.jsx'));
const CategoriesPage = lazy(() => import('/src/pages/CategoriesPage.jsx'));
const AdminOrderDetailPage = lazy(() => import('/src/pages/AdminOrderDetailPage.jsx'));
const UserManagementPage = lazy(() => import('/src/pages/UserManagementPage.jsx'));
const UserDetailPage = lazy(() => import('/src/pages/UserDetailPage.jsx'));

// Simple loading spinner component to show during page transitions
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-600"></div>
  </div>
);

export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  // Helper function to check for active order links (/, /orders/:id)
  const isOrdersActive = pathname === '/' || pathname.startsWith('/orders');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-teal-800 text-teal-50 flex flex-col">
        <div className="h-16 flex items-center justify-center text-2xl font-bold">
          ElectroSense
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          {/* Use NavLink for simple highlighting, manual check for complex one */}
          <NavLink
            to="/"
            className={() => `
              flex items-center px-4 py-2 rounded-md
              ${isOrdersActive ? 'bg-teal-700' : 'hover:bg-teal-700'}
            `}
          >
            <CreditCardIcon className="h-5 w-5 mr-3" />
            Orders
          </NavLink>
          
          <NavLink
            to="/inventory"
            className={({ isActive }) => `
              flex items-center px-4 py-2 rounded-md
              ${isActive ? 'bg-teal-700' : 'hover:bg-teal-700'}
            `}
          >
            <InboxStackIcon className="h-5 w-5 mr-3" />
            Inventory
          </NavLink>
          
          <NavLink
            to="/categories"
            className={({ isActive }) => `
              flex items-center px-4 py-2 rounded-md
              ${isActive ? 'bg-teal-700' : 'hover:bg-teal-700'}
            `}
          >
            <TagIcon className="h-5 w-5 mr-3" />
            Categories
          </NavLink>

          <NavLink
            to="/users"
            className={({ isActive }) => `
              flex items-center px-4 py-2 rounded-md
              ${isActive ? 'bg-teal-700' : 'hover:bg-teal-700'}
            `}
          >
            <UsersIcon className="h-5 w-5 mr-3" />
            User Management
          </NavLink>
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
          {/* --- 3. WRAP ROUTES IN SUSPENSE --- */}
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/users" element={<UserManagementPage />} />
              <Route path="/users/:userId" element={<UserDetailPage />} />
              <Route path="/orders/:orderId" element={<AdminOrderDetailPage />} />
              
              {/* Fallback for 404 */}
              <Route path="*" element={
                <div>
                  <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
                  <NavLink to="/" className="text-teal-600 hover:underline">
                    &larr; Back to Dashboard
                  </NavLink>
                </div>
              } />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

