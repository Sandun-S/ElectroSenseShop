import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';
import { useCartStore } from '../store.js';

export default function ItemDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such product!");
        }
      } catch (error) {
        console.error("Error fetching product: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-10">
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-600"></div>
      </div>
    </div>
  );
  if (!product) return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-10">
      <p>Product not found.</p>
    </div>
  );

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <img 
              src={product.imageUrl || `https://placehold.co/600x600/0d9488/white?text=${product.name}`} 
              alt={product.name}
              className="w-full rounded-lg object-cover"
            />
          </div>
          
          {/* Product Details */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-3xl font-semibold text-teal-600 mb-6">LKR {product.price.toFixed(2)}</p>
            <p className="text-gray-600 mb-6">{product.description}</p>
            <span className="text-sm text-green-600 font-medium mb-4">
              {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of Stock'}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              className="w-full bg-teal-600 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-teal-700 transition disabled:bg-gray-400"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

