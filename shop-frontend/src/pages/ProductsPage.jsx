import React from 'react';
import { useLocation } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import CategoryPill from '../components/CategoryPill';

export default function ProductsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  
  // Use the custom hook to fetch products based on URL params
  const { products, loading, error } = useProducts({ category, searchQuery });

  const categories = [
    'Microcontrollers', 
    'Sensors', 
    'Components', 
    'LEDs & Displays', 
    'Resistors'
  ];

  const getTitle = () => {
    if (searchQuery) return `Search results for "${searchQuery}"`;
    if (category) return category;
    return 'All Products';
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Categories</h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <CategoryPill to="/products" name="All Products" active={!category && !searchQuery} />
            </li>
            {categories.map(cat => (
              <li key={cat}>
                <CategoryPill 
                  to={`/products?category=${cat}`} 
                  name={cat} 
                  active={category === cat}
                />
              </li>
            ))}
          </ul>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{getTitle()}</h1>
          
          {loading && (
            <div className="flex justify-center items-center py-10">
              <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-teal-600"></div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error.message}. You may need to create a composite index in Firestore. Check the console for a link.</span>
            </div>
          )}
          
          {!loading && !error && products.length === 0 && (
             <div className="text-center py-10">
              <h2 className="text-2xl font-semibold text-gray-700">No Products Found</h2>
              <p className="text-gray-500 mt-2">Try adjusting your search or category filters.</p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

