import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, googleProvider, db } from '../firebaseConfig.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from URL params, or default to /my-account
  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/my-account';

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create user doc in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: name,
          email: email,
          createdAt: serverTimestamp(),
          isAdmin: false // Default to not admin
        });
      }
      navigate(redirectPath); // Redirect after success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore, if not, create them
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          createdAt: serverTimestamp(),
          isAdmin: false
        });
      }
      navigate(redirectPath);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </h1>
        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500" />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.gant.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500" />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-teal-700 transition disabled:bg-gray-400">
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <button onClick={handleGoogleSignIn} className="mt-6 w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M20 10.031C20 8.781 19.89 7.563 19.672 6.375h-9.672v3.656h5.484c-.234 1.188-.906 2.188-1.938 2.875v2.344h3.016c1.766-1.625 2.797-3.969 2.797-6.844z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M10 20c2.672 0 4.938-.875 6.578-2.375l-3.016-2.344c-.891.609-2.031.969-3.563.969-2.734 0-5.047-1.844-5.875-4.344H.984v2.422C2.625 18.109 6.031 20 10 20z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M4.125 12.188C3.891 11.563 3.75 10.813 3.75 10c0-.813.141-1.563.375-2.188V5.578H.984C.359 6.797 0 8.359 0 10c0 1.641.359 3.203.984 4.422l3.141-2.235z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M10 3.969c1.453 0 2.766.5 3.797 1.484l2.672-2.672C14.938 1.141 12.672 0 10 0 6.031 0 2.625 1.891.984 4.422l3.141 2.422C4.953 4.344 7.266 3.969 10 3.969z" clipRule="evenodd" />
            </svg>
            Sign in with Google
          </button>
        </div>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-teal-600 hover:text-teal-500 ml-1">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

