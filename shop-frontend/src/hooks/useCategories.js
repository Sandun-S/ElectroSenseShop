import { useState, useEffect } from 'react';
// --- FIX: Use absolute path from project root ---
import { db } from '/src/firebaseConfig.js'; 
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

/**
 * Custom hook to fetch categories from Firestore.
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      setError(new Error("Firestore is not initialized."));
      return;
    }

    setLoading(true);
    setError(null);
    
    const categoriesRef = collection(db, 'categories');
    // Query to get all categories, ordered by name
    const q = query(categoriesRef, orderBy('name'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const categoriesData = [];
        querySnapshot.forEach((doc) => {
          categoriesData.push({ id: doc.id, ...doc.data() });
        });
        setCategories(categoriesData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching categories: ", err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []); // Runs once on component mount

  return { categories, loading, error };
};

