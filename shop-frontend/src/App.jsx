import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ItemDetailPage from './pages/ItemDetailPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderSuccessPage from './pages/OrderSuccessPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import MyAccountPage from './pages/MyAccountPage.jsx';
import { useCurrentUser } from './hooks/useCurrentUser.js';

export default function App() {
  // This hook ensures we don't render the app until Firebase auth is ready
  const { user, authLoading } = useCurrentUser();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/item/:productId" element={<ItemDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/my-account" element={<MyAccountPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

