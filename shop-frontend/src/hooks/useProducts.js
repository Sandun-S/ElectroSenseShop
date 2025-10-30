import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig.js';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

// --- Custom Hook for Firestore Collection ---
// A reusable hook to fetch a collection from Firestore
export function useProducts(filters) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let q = query(collection(db, "products"));

    // Apply filters
    try {
      if (filters?.category) {
        q = query(q, where("category", "==", filters.category));
      }
      
      // Always filter out-of-stock items
      q = query(q, where("stockQuantity", ">", 0));

      if (filters?.searchQuery) {
        // Firestore is limited. We can't do a partial text search.
        // We can only do a "starts with" search.
        // This query works, but it's not ideal for search.
        const queryUpper = filters.searchQuery.charAt(0).toUpperCase() + filters.searchQuery.slice(1);
        q = query(q, 
          orderBy("name"), 
          where("name", ">=", filters.searchQuery),
          where("name", "<=", filters.searchQuery + '\uf8ff')
        );
        // A better long-term solution is a 3rd-party search like Algolia.
        // For now, this provides basic search.
      } else {
        // Default sort by name if not searching
        q = query(q, orderBy("name"));
      }

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
        setLoading(false);
      }, (err) => {
        console.error("Error fetching products: ", err);
        setError(err);
        setLoading(false);
      });

      return () => unsubscribe(); // Cleanup listener
    } catch (err) {
      // This catch block handles errors from building the query itself
      // (like the composite index error)
      console.error("Error building query: ", err);
      setError(err);
      setLoading(false);
    }

  }, [filters?.category, filters?.searchQuery]); // Re-run on filter changes

  return { products, loading, error };
}

