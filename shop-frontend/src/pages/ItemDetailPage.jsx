import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
// --- FIX: Use relative paths ---
import { db } from '../firebaseConfig.js';
import { useCartStore } from '../store.js';
import { PlusIcon, MinusIcon, ShoppingBagIcon, BoltIcon } from '@heroicons/react/24/outline';

export default function ItemDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setActiveImageIndex(0); // Reset image index on product change
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

  const handleIncrement = () => {
    // Ensure quantity is a number before incrementing
    const currentQuantity = Number(quantity) || 0;
    if (product && (currentQuantity + 1) <= product.stockQuantity) {
      setQuantity(currentQuantity + 1);
    }
  };

  const handleDecrement = () => {
    const currentQuantity = Number(quantity) || 0;
    if (currentQuantity > 1) {
      setQuantity(currentQuantity - 1);
    }
  };
  
  // --- NEW: Handler for typing directly into the input ---
  const handleQuantityChange = (e) => {
    const value = e.target.value;

    // Allow empty string, so user can delete "1" to type "10"
    if (value === '') {
      setQuantity('');
      return;
    }

    // Only allow digits
    if (!/^\d+$/.test(value)) {
      return;
    }

    let newQuantity = parseInt(value, 10);

    if (isNaN(newQuantity)) {
      newQuantity = 1; // Failsafe
    }
    
    if (newQuantity < 1) {
      newQuantity = 1;
    }

    if (newQuantity > product.stockQuantity) {
      newQuantity = product.stockQuantity;
    }
    
    setQuantity(newQuantity);
  };
  
  // --- NEW: Handler for when user clicks away from the input ---
  const handleQuantityBlur = () => {
    if (quantity === '') {
      setQuantity(1); // Reset to 1 if left empty
    }
  };

  const handleAddToCart = () => {
    // Ensure we add a valid number, default to 1 if empty
    const quantityToAdd = Number(quantity) || 1;
    addToCart(product, quantityToAdd);
  };

  const handleBuyNow = () => {
    const quantityToAdd = Number(quantity) || 1;
    addToCart(product, quantityToAdd);
    navigate('/checkout');
  };
  
  const renderSpecs = () => {
    if (!product || !product.specsDescription) {
      return <p className="text-gray-500">No specifications provided.</p>;
    }
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

  // --- NEW: Helper logic to get all available images ---
  // It handles both new `imageUrls` (array) and old `imageUrl` (string)
  const getDisplayImages = () => {
    if (product && product.imageUrls && Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
      // Use the new array, filtering out any empty strings
      return product.imageUrls.filter(url => url && typeof url === 'string' && url.trim() !== '');
    }
    if (product && product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.trim() !== '') {
      // Fallback to the old single image string, return as an array
      return [product.imageUrl];
    }
    // Return a placeholder if no images are found
    return [`https://placehold.co/600x600/0d9488/white?text=${product ? product.name : 'Image'}`];
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
  const displayImages = getDisplayImages(); // Get the list of images

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* --- Image Gallery --- */}
          <div>
            {/* Main Image */}
            <div className="w-full h-auto max-h-[500px] flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden p-4 shadow-inner bg-gray-50">
              <img 
                src={displayImages[activeImageIndex]} 
                alt={product.name}
                className="w-full h-auto max-h-[450px] object-contain rounded-lg"
              />
            </div>
            
            {/* Thumbnail Gallery */}
            {displayImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto mt-4 p-2">
                {displayImages.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                      index === activeImageIndex
                        ? 'border-teal-600 opacity-100 ring-2 ring-teal-300'
                        : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-400'
                    }`}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                  </button>
              ))}
            </div>
          )}
        </div>
        {/* --- END: Image Gallery --- */}
          
          
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
                  
                  {/* --- FIX: Replaced <span> with <input> --- */}
                  <input
                    type="text"
                    inputMode="numeric" // For mobile keyboards
                    pattern="\d*"
                    value={quantity}
                    onChange={handleQuantityChange}
                    onBlur={handleQuantityBlur}
                    aria-label="Quantity"
                    className="px-5 py-2 text-lg font-semibold text-center w-20 border-x border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  {/* --- END FIX --- */}
                  
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
            
            <div className="space-y-2 text-sm text-gray-600">
              {product.sku && (
                <p><strong>SKU:</strong> {product.sku}</p>
              )}
              {product.category && (
                <p><strong>Category:</strong> 
                  <Link to={`/products?category=${product.category}`} className="text-teal-600 hover:underline ml-1">
                    {product.category}
                  </Link>
                </p>
              )}
              {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
                <p><strong>Tags:</strong> 
                  {product.tags.map((tag, i) => (
                    <span key={i} className="ml-1 after:content-[','] last:after:content['']">
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
                {/* Use pre-line to respect newlines in the description */}
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



