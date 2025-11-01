import React from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store.js';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function ProductCard({ product }) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Stop event bubbling
    addToCart(product);
  };

  return (
    <Link to={`/products/${product.id}`} className="group bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-xl transition">
      <div className="h-48 overflow-hidden relative">
        <img 
          src={product.imageUrl || `https://placehold.co/400x400/0d9488/white?text=${product.name}`} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate" title={product.name}>{product.name}</h3>
        <p className="text-sm text-gray-500 mb-4">{product.category}</p>
        <div className="mt-auto flex justify-between items-center">
          <span className="text-2xl font-bold text-primary">LKR {product.price.toFixed(2)}</span>
          <button 
            onClick={handleAddToCart}
            className="bg-primary-100 text-primary rounded-full h-10 w-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-primary hover:text-white"
            aria-label="Add to cart"
          >
            <ShoppingCartIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </Link>
  );
}

