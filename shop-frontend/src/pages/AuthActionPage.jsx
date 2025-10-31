/* This is the content for AuthActionPage.jsx */
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { auth } from '/src/firebaseConfig.js';
import { 
  applyActionCode, 
  confirmPasswordReset, 
  verifyPasswordResetCode 
} from 'firebase/auth';

// Helper hook to get URL parameters
function useAuthActionInfo() {
  const [searchParams] = useSearchParams();
  return {
    mode: searchParams.get('mode'),
    actionCode: searchParams.get('oobCode'),
    continueUrl: searchParams.get('continueUrl'),
  };
}

export default function AuthActionPage() {
  const { mode, actionCode } = useAuthActionInfo();
  
  if (!mode || !actionCode) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Invalid Link</h1>
        <p className="text-gray-600">This action link is invalid or has expired.</p>
        <Link to="/" className="text-teal-600 hover:underline mt-4 inline-block">Back to Home</Link>
      </div>
    );
  }

  // Use a switch to show the correct UI
  switch (mode) {
    case 'resetPassword':
      return <ResetPassword actionCode={actionCode} />;
    case 'verifyEmail':
      return <VerifyEmail actionCode={actionCode} />;
    default:
      return (
        <div className="text-center">
          <h1 className="text-2xl font-bold">Unknown Action</h1>
          <p className="text-gray-600">This link is not recognized.</p>
          <Link to="/" className="text-teal-600 hover:underline mt-4 inline-block">Back to Home</Link>
        </div>
      );
  }
}

// --- Password Reset Component ---
function ResetPassword({ actionCode }) {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  // Verify the code first to make sure it's valid
  useEffect(() => {
    verifyPasswordResetCode(auth, actionCode)
      .then((userEmail) => {
        setEmail(userEmail);
      })
      .catch((err) => {
        setError("This link is invalid or has expired. Please request a new password reset.");
      });
  }, [actionCode]);

  const handleResetPassword = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    confirmPasswordReset(auth, actionCode, newPassword)
      .then(() => {
        setLoading(false);
        setSuccess(true);
        // Automatically redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      })
      .catch((err) => {
        setLoading(false);
        setError("Error resetting password. Please try again.");
      });
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Password Updated!</h1>
        <p className="text-gray-700">Your password has been successfully reset. Redirecting you to the login page...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Reset Your Password</h1>
      <p className="text-center text-gray-600 mb-4">Enter a new password for {email}</p>
      <form onSubmit={handleResetPassword} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            name="password"
            id="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          />
        </div>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-teal-700 transition disabled:bg-gray-400">
          {loading ? 'Saving...' : 'Save New Password'}
        </button>
      </form>
    </div>
  );
}

// --- Email Verification Component ---
function VerifyEmail({ actionCode }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    applyActionCode(auth, actionCode)
      .then(() => {
        setSuccess(true);
        // Automatically redirect to home after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      })
      .catch((err) => {
        setError("This verification link is invalid or has expired. Please try signing in again.");
      });
  }, [actionCode, navigate]);

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Email Verified!</h1>
        <p className="text-gray-700">Thank you for verifying your email. Redirecting you to the homepage...</p>
      </div>
    );
  }
  
  if (error) {
     return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Verifying your email...</h1>
      <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-teal-600 mx-auto"></div>
    </div>
  );
}