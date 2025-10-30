import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore';

/**
 * A custom hook to fetch products from Firestore.
 * This hook now handles all query logic and loading/error states.
 *
 * @param {string} categoryName - The category to filter by (e.g., "Microcontrollers")
 * @param {string} searchQuery - The search term to filter by
 */
export const useProducts = (categoryName, searchQuery) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Get a reference to the 'products' collection
    const productsRef = collection(db, 'products');
    
    // Start with a base query
    let q = query(productsRef);

    // --- THIS IS THE NEW, VALID QUERY LOGIC ---

    if (searchQuery) {
      // Search query: Filter by name
      // This requires a single-field index on 'name' (which is automatic)
      // Note: This is a simple "starts with" search.
      q = query(
        productsRef,
        orderBy('name'),
        where('name', '>=', searchQuery),
        where('name', '<=', searchQuery + '\uf8ff')
      );
    } else if (categoryName) {
      // Category query: Filter by category, then sort by name
      // This requires a composite index: (category ASC, name ASC)
      q = query(
        productsRef,
        where('category', '==', categoryName),
        orderBy('name')
      );
    } else {
      // No filter: Just get all products, sorted by name
      // This requires a single-field index on 'name' (which is automatic)
      q = query(productsRef, orderBy('name'));
    }

    // Set up the real-time listener
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const productsData = [];
        querySnapshot.forEach((doc) => {
          productsData.push({ id: doc.id, ...doc.data() });
        });

        // --- FILTER FOR STOCK ON THE CLIENT-SIDE ---
        // This avoids the "illegal" composite query on stockQuantity
        const inStockProducts = productsData.filter(
          (product) => product.stockQuantity > 0
        );

        setProducts(inStockProducts);
        setLoading(false);
      }, 
      (err) => {
        // Handle errors from Firestore
        console.error("Error fetching products: ", err);
        setError(err.message + ". You may need to create a composite index in Firestore. Check the console for a link.");
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();

  }, [categoryName, searchQuery]); // Re-run the effect if category or search changes

  return { products, loading, error };
};

