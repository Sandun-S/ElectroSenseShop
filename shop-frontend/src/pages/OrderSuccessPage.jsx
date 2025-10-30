import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function OrderSuccessPage() {
  const location = useLocation();
  // Get the orderId passed from the CheckoutPage
  const orderId = location.state?.orderId;

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-700 mb-6">Thank you for your purchase. Your order is now pending payment.</p>
        
        <div className="bg-teal-50 p-6 rounded-lg text-left">
          <h2 className="text-xl font-semibold text-teal-900 mb-4">Bank Transfer Details</h2>
          <p className="text-gray-800">Please transfer the total amount to the account below:</p>
          <ul className="my-4 space-y-2 font-mono">
            <li><strong>Bank:</strong> Commercial Bank</li>
            <li><strong>Account Name:</strong> ElectroSense (Pvt) Ltd</li>
            <li><strong>Account Number:</strong> 1234 5678 90</li>
            <li><strong>Branch:</strong> Malabe</li>
          </ul>
          <p className="text-red-600 font-medium">
            **Important:** Please use your Order ID as the payment reference.
            <br />
            {orderId ? (
              <strong className="text-lg">Your Order ID is: {orderId}</strong>
            ) : (
              <span className="text-sm">(You can find your Order ID in "My Account")</span>
            )}
          </p>
        </div>
        
        <Link to="/" className="mt-8 inline-block bg-teal-600 text-white font-bold py-3 px-6 rounded-md hover:bg-teal-700 transition">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

