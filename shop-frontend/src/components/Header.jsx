import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig.js';
import { signOut } from 'firebase/auth';
import { useCartStore } from '../store.js';
import { 
  ShoppingCartIcon, UserIcon, ArrowLeftOnRectangleIcon, Bars3Icon, XMarkIcon, 
  MagnifyingGlassIcon, SparklesIcon 
} from '@heroicons/react/24/outline';

export default function Header({ user }) {
  const navigate = useNavigate();
  // --- FIX: Calculate totalItems reactively from the cart state ---
  const totalItems = useCartStore((state) =>
    state.cart.reduce((sum, item) => sum + item.quantity, 0)
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-3xl font-bold text-primary">
              <SparklesIcon className="h-8 w-8 inline-block mr-2" />
              ElectroSense
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden sm:flex flex-1 max-w-lg mx-4">
             {/* This search is a form now, pointing to the products page */}
            <form action="/products" method="get" className="relative w-full">
              <input
                type="search"
                name="search" // The form will submit this as a URL query param
                placeholder="Search for Arduino, Sensors, ESP..."
                className="block w-full pl-4 pr-12 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <button type="submit" className="absolute inset-y-0 right-0 flex items-center justify-center w-12 bg-primary text-white rounded-r-md hover:bg-primary-700">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Desktop Nav Icons */}
          <div className="hidden sm:flex sm:items-center sm:space-x-6">
            <Link to="/products" className="text-gray-600 hover:text-primary">
              All Products
            </Link>
            {user ? (
              <>
                <Link to="/my-account" className="flex items-center text-gray-600 hover:text-primary">
                  <UserIcon className="h-6 w-6 mr-1" />
                  My Account
                </Link>
                <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-primary">
                  <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth" className="flex items-center text-gray-600 hover:text-primary">
                <UserIcon className="h-6 w-6 mr-1" />
                Login
              </Link>
            )}
            <Link to="/cart" className="relative text-gray-600 hover:text-primary">
              <ShoppingCartIcon className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative text-gray-600 hover:text-teal-600 sm:hidden">
              <ShoppingCartIcon className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden px-2 pt-2 pb-3 space-y-1">
          {/* Mobile Search */}
          <form action="/products" method="get" className="relative w-full mb-2">
            <input
              type="search"
              name="search"
              placeholder="Search..."
              className="block w-full pl-4 pr-12 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            />
            <button type="submit" className="absolute inset-y-0 right-0 flex items-center justify-center w-12 bg-teal-600 text-white rounded-r-md hover:bg-teal-700">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </form>
          
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">All Products</Link>
          {user ? (
            <>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/my-account" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">My Account</Link>
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Logout</button>
            </>
          ) : (
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/auth" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}

