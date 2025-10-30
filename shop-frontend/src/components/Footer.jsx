import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">ElectroSense</h3>
            <p className="text-gray-400">Your #1 source for electronic components and project kits in Sri Lanka.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/products?category=Microcontrollers" className="hover:text-white">Microcontrollers</Link></li>
              <li><Link to="/products?category=Sensors" className="hover:text-white">Sensors</Link></li>
              <li><Link to="/products?category=Components" className="hover:text-white">Components</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/my-account" className="hover:text-white">My Account</Link></li>
              <li><Link to="/cart" className="hover:text-white">View Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: contact@electrosense.com</li>
              <li>Phone: +94 77 123 4567</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-gray-500">
          &copy; {new Date().getFullYear()} ElectroSense. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

