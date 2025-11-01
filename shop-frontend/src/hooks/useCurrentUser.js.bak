import { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig.js';
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';

// --- Custom Hook for Auth State ---
// A reusable hook to get the current user and loading state
export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Set auth persistence to local storage
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setAuthLoading(false);
        });
        return unsubscribe; // Cleanup subscription on unmount
      })
      .catch((error) => {
        console.error("Error setting auth persistence: ", error);
        setAuthLoading(false);
      });
  }, []);

  return { user, authLoading };
}

