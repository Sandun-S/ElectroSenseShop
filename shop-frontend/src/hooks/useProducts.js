import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

/**
 * Custom hook to fetch products from Firestore based on category and search query.
 * @param {Object} props - The hook's properties.
 * @param {string | null} props.category - The category to filter by.
 * @param {string | null} props.searchQuery - The search term.
 */
// --- FIX: Added a default empty object {} to props to prevent crash ---
export const useProducts = (props = {}) => {
  // --- FIX: Destructure props *inside* the hook ---
  const { category, searchQuery } = props; 
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const productsRef = collection(db, 'products');
    let q;

    // --- QUERY LOGIC ---
    if (searchQuery) {
      // Search query (case-insensitive)
      // Note: This requires a composite index on (name, category) if you combine it
      // For now, search ignores category.
      const endStr = searchQuery.toLowerCase() + '\uf8ff';
      q = query(
        productsRef,
        orderBy('name'), // Assumes 'name' index is enabled
        where('name', '>=', searchQuery.toLowerCase()),
        where('name', '<=', endStr)
      );
    } else if (category) {
      // Category query
      q = query(
        productsRef,
        where('category', '==', category),
        orderBy('name') // Assumes (category, name) index is enabled
      );
    } else {
      // --- THIS IS THE FIX ---
      // Default "All Products" query.
      // Changed from orderBy('name') to orderBy('createdAt', 'desc')
      // 'createdAt' is automatically indexed by Firestore,
      // which avoids the infinite loop error we were seeing.
      q = query(productsRef, orderBy('createdAt', 'desc'));
    }
    // --- END QUERY LOGIC ---

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const productsData = [];
        querySnapshot.forEach((doc) => {
          productsData.push({ id: doc.id, ...doc.data() });
        });
        
        // Client-side filtering for stock
        const inStockProducts = productsData.filter(p => p.stockQuantity > 0);
        
        setProducts(inStockProducts);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching products: ", err);
        setError(err); // This was line 67
        setLoading(false);
      }
    );

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [category, searchQuery]); // Re-run effect when category or search changes

  return { products, loading, error };
};


