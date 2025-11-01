import React, { useState } from 'react';
// --- FIX: Use root-relative path ---
import { db } from '/src/firebaseConfig.js'; 
import { 
  doc, updateDoc, addDoc, collection, serverTimestamp 
} from 'firebase/firestore';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function ProductModal({ product, onClose }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    stockQuantity: product?.stockQuantity || 0,
    category: product?.category || '',
    imageUrl: product?.imageUrl || '',
    description: product?.description || ''
  });
  const [loading, setLoading] = useState(false);

  const isEditing = !!product;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity, 10)
      };

      if (isEditing) {
        // Update existing product
        const productRef = doc(db, 'products', product.id);
        await updateDoc(productRef, dataToSave);
      } else {
        // Add new product
        await addDoc(collection(db, 'products'), {
          ...dataToSave,
          createdAt: serverTimestamp(),
          stockReserved: 0 // This field is important!
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving product: ", error);
      alert("Error saving product.");
    } finally {
      setLoading(false);
    }
  };

  // --- THIS IS THE CORRECT JSX FOR THE MODAL ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8 m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (LKR)</label>
              <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500" />
            </div>
            <div>
              <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">Stock Quantity</label>
              <input type="number" name="stockQuantity" id="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500" />
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500" />
          </div>
          
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
            <input type="url" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" id="description" rows="3" value={formData.description} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"></textarea>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-400">
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

