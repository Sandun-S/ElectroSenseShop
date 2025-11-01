import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
// --- FIX: Use absolute paths ---
import { useProducts } from '/src/hooks/useProducts.js';
import { useCategories } from '/src/hooks/useCategories.js'; 
import ProductCard from '/src/components/ProductCard.jsx';
import CategoryPill from '/src/components/CategoryPill.jsx';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function ProductsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  
  // --- 1. STATE FOR NEW FILTERS ---
  const [sortBy, setSortBy] = useState('latest'); // 'latest', 'price-asc', 'price-desc'
  const [showOutOfStock, setShowOutOfStock] = useState(false);

  // Use the custom hook to fetch products (now returns all products)
  const { products, loading: productsLoading, error: productsError } = useProducts({ 
    category: categoryParam, 
    searchQuery 
  });
  
  // Fetch categories
  const { 
    categories, 
    loading: categoriesLoading, 
    error: categoriesError 
  } = useCategories();

  // --- 2. CLIENT-SIDE FILTERING & SORTING ---
  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    // First, filter by stock
    let filtered = products;
    if (!showOutOfStock) {
      filtered = products.filter(p => p.stockQuantity > 0);
    }

    // Next, apply sorting
    let sorted = [...filtered]; // Create a new array to sort
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'latest':
      default:
        // 'useProducts' hook already sorts by 'createdAt' desc by default for "All Products"
        // If a category is selected, it sorts by 'name'. We need to re-sort by date.
        // We'll sort by 'createdAt' if it exists, otherwise fall back to name
        sorted.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : 0;
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : 0;
          return dateB - dateA; // Newest first
        });
        break;
    }
    
    return sorted;
  }, [products, sortBy, showOutOfStock]); // Re-run when products or filters change

  const getTitle = () => {
    if (searchQuery) return `Search results for "${searchQuery}"`;
    if (categoryParam) return categoryParam;
    return 'All Products';
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Categories</h3>
          <div className="max-h-96 overflow-y-auto pr-2">
            <ul className="space-y-2 text-gray-600">
              <li>
                <CategoryPill 
                  to="/products" 
                  name="All Products" 
                  active={!categoryParam && !searchQuery} 
                />
              </li>
              {categoriesLoading && <li className="text-gray-500 text-sm">Loading categories...</li>}
              {categoriesError && <li className="text-red-500 text-sm">Error loading categories.</li>}
              {categories.map(cat => (
                <li key={cat.id}>
                  <CategoryPill 
                    to={`/products?category=${cat.name}`} 
                    name={cat.name} 
                    active={categoryParam === cat.name}
                  />
                </li>
              ))}
            </ul>
          </div>
          
          {/* --- 3. NEW FILTER UI --- */}
          <div className="space-y-6 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">Filters</h3>
            
            {/* Sort By Dropdown */}
            <div>
              <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700">
                Sort by
              </label>
              <div className="relative mt-1">
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md appearance-none"
                >
                  <option value="latest">Sort by latest</option>
                  <option value="price-asc">Sort by price: low to high</option>
                  <option value="price-desc">Sort by price: high to low</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDownIcon className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Stock Checkbox */}
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="show-out-of-stock"
                  type="checkbox"
                  checked={showOutOfStock}
                  onChange={(e) => setShowOutOfStock(e.target.checked)}
                  className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="show-out-of-stock" className="font-medium text-gray-700">
                  Show out of stock
                </label>
              </div>
            </div>
          </div>
          {/* --- END: NEW FILTER UI --- */}

        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{getTitle()}</h1>
          
          {productsLoading && (
            <div className="flex justify-center items-center py-10">
              <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-teal-600"></div>
            </div>
          )}
          
          {productsError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {productsError.message}. Check the console for a link to create a Firestore index.</span>
            </div>
          )}
          
          {/* --- 4. USE THE NEW FILTERED LIST --- */}
          {!productsLoading && !productsError && filteredAndSortedProducts.length === 0 && (
             <div className="text-center py-10">
               <h2 className="text-2xl font-semibold text-gray-700">No Products Found</h2>
               <p className="text-gray-500 mt-2">
                 {products.length > 0 ? "All products are filtered out." : "Try adjusting your search or category filters."}
               </p>
             </div>
          )}

          {!productsLoading && !productsError && filteredAndSortedProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

