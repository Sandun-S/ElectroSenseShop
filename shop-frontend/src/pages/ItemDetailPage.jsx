import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
// --- FIX: Use root-relative paths ---
import { db } from '/src/firebaseConfig.js';
import { useCartStore } from '/src/store.js';
import { PlusIcon, MinusIcon, ShoppingBagIcon, BoltIcon } from '@heroicons/react/24/outline';

export default function ItemDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  // --- NEW: Get navigation for 'Buy Now' ---
  const navigate = useNavigate();
  
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

  // --- NEW: Quantity control functions ---
  const handleIncrement = () => {
    if (product && quantity < product.stockQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout'); // Assumes your checkout page is at /checkout
  };
  
  const renderSpecs = () => {
    // --- FIX: Add a check for product.specsDescription ---
    if (!product || !product.specsDescription) {
      return <p className="text-gray-500">No specifications provided.</p>;
    }
    // Splits the string by new lines and creates a list
    return (
      <ul className="space-y-2">
        {product.specsDescription.split('\n').map((line, index) => (
          <li key={index} className="flex flex-col sm:flex-row">
            <span className="font-semibold w-full sm:w-32 flex-shrink-0">{line.split(':')[0]}</span>
            <span className="text-gray-700">{line.split(':').slice(1).join(':')}</span>
          </li>
        ))}
      </ul>
    );
  };

  if (loading) return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-10">
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-600"></div>
      </div>
    </div>
  );
  
  if (!product) return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-10">
      <p>Product not found.</p>
    </div>
  );
  
  const isOutOfStock = !product.stockQuantity || product.stockQuantity === 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <img 
              src={product.imageUrl || `https://placehold.co/600x600/0d9488/white?text=${product.name}`} 
              alt={product.name}
              className="w-full h-auto max-h-[500px] object-contain rounded-lg"
            />
          </div>
          
          {/* Product Details */}
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
            <p className="text-3xl font-semibold text-teal-600 mb-4">LKR {product.price.toFixed(2)}</p>
            
            <span className={`font-medium mb-4 px-3 py-1 rounded-full self-start ${
              isOutOfStock 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {isOutOfStock ? 'Out of Stock' : `${product.stockQuantity} in stock`}
            </span>
            
            {/* --- NEW: Quantity Selector --- */}
            {!isOutOfStock && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center border border-gray-300 rounded-md w-max">
                  <button
                    onClick={handleDecrement}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-l-md"
                    aria-label="Decrease quantity"
                  >
                    <MinusIcon className="h-5 w-5" />
                  </button>
                  <span className="px-5 py-2 text-lg font-semibold">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-r-md"
                    aria-label="Increase quantity"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
            
            {/* --- NEW: Action Buttons --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex items-center justify-center bg-teal-600 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-teal-700 transition disabled:bg-gray-400"
              >
                <ShoppingBagIcon className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex items-center justify-center bg-teal-800 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-teal-900 transition disabled:bg-gray-400"
              >
                <BoltIcon className="h-5 w-5 mr-2" />
                Buy Now
              </button>
            </div>
            
            {/* --- NEW: Meta Info --- */}
            <div className="space-y-2 text-sm text-gray-600">
              {product.sku && (
                <p><strong>SKU:</strong> {product.sku}</p>
              )}
              {product.category && (
                <p><strong>Category:</strong> 
                  {/* --- FIX: Removed .toLowerCase() --- */}
                  <Link to={`/products?category=${product.category}`} className="text-teal-600 hover:underline ml-1">
                    {product.category}
                  </Link>
                </p>
              )}
              {/* --- THIS IS THE FIX --- */}
              {/* Check if product.tags exists AND is an Array before trying to map */}
              {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
                <p><strong>Tags:</strong> 
                  {product.tags.map((tag, i) => (
                    <span key={i} className="ml-1 after:content-[','] last:after:content['']">
                      {/* --- FIX: Removed .toLowerCase() --- */}
                      <Link to={`/products?tag=${tag}`} className="text-teal-600 hover:underline">
                        {tag}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
            </div>

          </div>
        </div>
        
        {/* --- NEW: Description & Specs Tabs --- */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('description')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${
                  activeTab === 'description'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${
                  activeTab === 'specs'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Specifications
              </button>
            </nav>
          </div>
          
          <div className="py-6">
            {activeTab === 'description' && (
              <div className="prose prose-lg max-w-none text-gray-700">
                <p style={{ whiteSpace: 'pre-line' }}>
                  {product.description || 'No description provided.'}
                </p>
              </div>
            )}
            {activeTab === 'specs' && (
              <div>
                {renderSpecs()}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}

