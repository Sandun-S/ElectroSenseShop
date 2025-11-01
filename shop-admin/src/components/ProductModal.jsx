import React, { useState, useEffect } from 'react';
import {
  doc, getDoc, addDoc, updateDoc, collection, query,
  onSnapshot, orderBy, where, getDocs
} from 'firebase/firestore';
// Import db using the absolute path
import { db } from '/src/firebaseConfig.js';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

/**
 * Generates the next sequential SKU for a given prefix.
 * e.g., if prefix is "MICR" and "MICR0002" is the last one, it returns "MICR0003".
 */
async function generateNextSku(prefix) {
  if (!db) throw new Error("Firestore is not initialized.");

  // Query for all products that start with this prefix.
  // This gives us MICR, MICR0001, MICR0002, etc.
  const productsRef = collection(db, 'products');
  const q = query(
    productsRef,
    where('sku', '>=', prefix),
    where('sku', '<=', prefix + '\uf8ff') // '\uf8ff' is a high-sorting character
  );

  try {
    const querySnapshot = await getDocs(q);
    let maxNumber = 0;

    querySnapshot.forEach(doc => {
      const sku = doc.data().sku;
      // Extract the number part of the SKU
      const numStr = sku.substring(prefix.length);
      
      // Check if it's a valid number
      if (/^\d+$/.test(numStr)) {
        const num = parseInt(numStr, 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    // New number is max + 1
    const nextNumber = maxNumber + 1;
    // Pad with leading zeros to 4 digits
    const paddedNumber = nextNumber.toString().padStart(4, '0');
    
    return `${prefix}${paddedNumber}`; // e.g., MICR0003

  } catch (error) {
    console.error("Error generating SKU: ", error);
    // Fallback to a random number if query fails
    return `${prefix}${Date.now().toString().slice(-4)}`;
  }
}


export default function ProductModal({ product, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    stockQuantity: 0,
    description: '',
    sku: '',
    specsDescription: '', // NEW FIELD
    tags: '', // NEW FIELD (as comma-separated string)
    imageUrls: [''], // NEW FIELD (as array, starts with one empty)
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSkuGenerating, setIsSkuGenerating] = useState(false);

  // Fetch categories for the dropdown
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'categories'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.error("Error fetching categories:", err);
    });
    return () => unsubscribe();
  }, []);

  // If a product is passed, fill the form for editing
  useEffect(() => {
    if (product) {
      // Handle backwards compatibility for images
      let images = ['']; // Default
      if (product.imageUrls && product.imageUrls.length > 0) {
        images = product.imageUrls;
      } else if (product.imageUrl) {
        images = [product.imageUrl]; // Convert old string to array
      }

      setFormData({
        name: product.name || '',
        category: product.category || '',
        price: product.price || 0,
        stockQuantity: product.stockQuantity || 0,
        description: product.description || '',
        sku: product.sku || '',
        specsDescription: product.specsDescription || '', // NEW
        tags: (product.tags || []).join(', '), // NEW (convert array to string)
        imageUrls: images, // NEW
      });
    } else {
      // Reset form if no product (for "Add" mode)
      setFormData({
        name: '', category: '', price: 0, stockQuantity: 0, description: '',
        sku: '', specsDescription: '', tags: '', imageUrls: ['']
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- NEW: Handlers for dynamic image URLs ---
  const handleImageChange = (index, value) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls[index] = value;
    setFormData(prev => ({ ...prev, imageUrls: newImageUrls }));
  };

  const addImageUrlInput = () => {
    setFormData(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ''] // Add a new empty string
    }));
  };

  const removeImageUrlInput = (index) => {
    // Don't remove the last one
    if (formData.imageUrls.length <= 1) return;
    const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, imageUrls: newImageUrls }));
  };
  // --- END: Image URL Handlers ---


  const handleCategoryChange = async (e) => {
    const categoryName = e.target.value;
    const selectedCat = categories.find(c => c.name === categoryName);
    const prefix = selectedCat ? selectedCat.skuPrefix : 'GEN';
    
    setFormData(prev => ({
      ...prev,
      category: categoryName,
      sku: 'Generating...' // Placeholder
    }));
    
    setIsSkuGenerating(true);

    // Only generate a new SKU for NEW products
    if (!product) { 
      const newSku = await generateNextSku(prefix);
      setFormData(prev => ({
        ...prev,
        sku: newSku
      }));
    } else {
      // If editing, just set the category, keep the existing SKU
      setFormData(prev => ({
        ...prev,
        sku: prev.sku || `${prefix}0000` // Keep old SKU
      }));
    }
    setIsSkuGenerating(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db) {
      console.error("Firestore (db) is not initialized.");
      return;
    }
    setLoading(true);

    // Prepare data for saving
    const dataToSave = {
      ...formData,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity, 10),
      // NEW: Convert tags string back to array, filter empty
      tags: formData.tags.split(',')
                         .map(t => t.trim())
                         .filter(t => t.length > 0),
      // NEW: Filter out empty image URLs
      imageUrls: formData.imageUrls.filter(url => url.trim().length > 0),
      specsDescription: formData.specsDescription,
    };
    
    // Delete old fields we no longer use
    delete dataToSave.imageUrl; // remove old single image field

    try {
      if (product) {
        // Update existing product
        const productRef = doc(db, 'products', product.id);
        await updateDoc(productRef, dataToSave);
      } else {
        // Add new product
        await addDoc(collection(db, 'products'), {
          ...dataToSave,
          createdAt: new Date() // Add createdAt timestamp
        });
      }
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Error saving product: ", error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500" />
            </div>

            {/* Category Dropdown */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select name="category" id="category" value={formData.category} onChange={handleCategoryChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
                <option value="" disabled>Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* SKU (auto-generated but editable) */}
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU</label>
              <input type="text" name="sku" id="sku" value={formData.sku} onChange={handleChange} disabled={isSkuGenerating}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 focus:border-teal-500 focus:ring-teal-500" />
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (LKR)</label>
                <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500" />
              </div>
              <div>
                <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                <input type="number" name="stockQuantity" id="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required min="0" step="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500" />
              </div>
            </div>

            {/* --- NEW: Image URLs --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs</label>
              <div className="space-y-2">
                {formData.imageUrls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="url"
                      placeholder={index === 0 ? "Main Image URL (required)" : "Additional Image URL"}
                      value={url}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      required={index === 0} // Only first image is required
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                    {/* Show remove button only for extra images */}
                    {index > 0 && (
                      <button type="button" onClick={() => removeImageUrlInput(index)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addImageUrlInput}
                className="mt-2 flex items-center text-sm text-teal-600 hover:text-teal-800 font-medium"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Image URL
              </button>
            </div>
            
            {/* --- NEW: Tags --- */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
              <input type="text" name="tags" id="tags" value={formData.tags} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500" />
              <p className="mt-1 text-xs text-gray-500">Separate tags with a comma (e.g., Sensor, Arduino, IoT)</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Main Description</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
              </textarea>
            </div>

            {/* --- NEW: Specs Description --- */}
            <div>
              <label htmlFor="specsDescription" className="block text-sm font-medium text-gray-700">Specifications Description</label>
              <textarea name="specsDescription" id="specsDescription" value={formData.specsDescription} onChange={handleChange} rows="5"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
              </textarea>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose}
              className="bg-white py-2 px-4 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading || isSkuGenerating || !db}
              className="bg-teal-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-teal-700 transition disabled:opacity-50">
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Save Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

