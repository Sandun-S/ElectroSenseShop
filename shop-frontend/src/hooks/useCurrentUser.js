import { useState, useEffect } from 'react';
// --- FIX: Use correct relative path ---
import { auth, db } from '../firebaseConfig.js';
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
// --- 1. IMPORT FIRESTORE TOOLS ---
import { doc, onSnapshot } from 'firebase/firestore';

// --- Custom Hook for Auth State ---
// A reusable hook to get the current user and loading state
export function useCurrentUser() {
  const [user, setUser] = useState(null); // Firebase Auth user
  // --- 2. NEW STATE FOR FIRESTORE USER DOCUMENT ---
  const [firestoreUser, setFirestoreUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let unsubscribeFirestore = () => {}; // Placeholder for firestore listener cleanup

    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // Listen for auth state changes
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
          
          // --- 3. UPDATED LOGIC ---
          if (currentUser) {
            // User is logged in
            setUser(currentUser);
            
            // Now, listen for changes to their Firestore document
            const userDocRef = doc(db, 'users', currentUser.uid);
            
            // Clean up old firestore listener if it exists
            unsubscribeFirestore(); 
            
            unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
              if (docSnap.exists()) {
                setFirestoreUser(docSnap.data());
              } else {
                // User is authenticated, but no firestore doc exists
                // This might happen if creation failed
                console.warn("User is authenticated but no Firestore doc found.");
                setFirestoreUser(null);
              }
              setAuthLoading(false);
            }, (error) => {
              console.error("Error fetching user document:", error);
              setFirestoreUser(null);
              setAuthLoading(false);
            });

          } else {
            // User is logged out
            setUser(null);
            setFirestoreUser(null);
            setAuthLoading(false);
            // Clean up any lingering firestore listener
            unsubscribeFirestore();
          }
        });
        
        // Return cleanup function for auth
        return () => {
          unsubscribeAuth();
          unsubscribeFirestore();
        }; 
      })
      .catch((error) => {
        console.error("Error setting auth persistence: ", error);
        setAuthLoading(false);
      });

  }, []); // Empty dependency array ensures this runs once on mount

  // --- 4. RETURN ALL DATA ---
  return { user, firestoreUser, authLoading };
}
