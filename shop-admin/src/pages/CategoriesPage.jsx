import React, { useState, useEffect } from 'react';
// --- FIX: Remove file extensions from imports for Vite/esbuild ---
import { db } from '../firebaseConfig';
import { 
  collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc 
} from 'firebase/firestore';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
// --- FIX: Remove file extensions from imports for Vite/esbuild ---
import ConfirmModal from '../components/ConfirmModal';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const [skuPrefix, setSkuPrefix] = useState('');
  const [icon, setIcon] = useState(''); // --- NEW: State for icon ---
  const [editingId, setEditingId] = useState(null);

  // --- FIX: State for confirm modal ---
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Fetch categories in real-time
  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Error fetching categories:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // --- MODIFIED: Add icon to validation ---
    if (!categoryName || !skuPrefix || !icon) {
      console.error("Please fill in all fields."); // Use console.error
      return;
    }

    try {
      if (editingId) {
        // Update existing category
        const categoryRef = doc(db, 'categories', editingId);
        // --- MODIFIED: Add icon to update ---
        await updateDoc(categoryRef, {
          name: categoryName,
          skuPrefix: skuPrefix.toUpperCase(),
          icon: icon
        });
      } else {
        // Add new category
        // --- MODIFIED: Add icon to addDoc ---
        await addDoc(collection(db, 'categories'), {
          name: categoryName,
          skuPrefix: skuPrefix.toUpperCase(),
          icon: icon
        });
      }
      // Reset form
      setCategoryName('');
      setSkuPrefix('');
      setIcon(''); // --- NEW: Reset icon state ---
      setEditingId(null);
    } catch (error) {
      console.error("Error saving category: ", error);
    }
  };

  const handleEdit = (category) => {
    setCategoryName(category.name);
    setSkuPrefix(category.skuPrefix);
    setIcon(category.icon || ''); // --- NEW: Set icon on edit ---
    setEditingId(category.id);
  };

  // --- FIX: Use Modal flow for delete ---
  const handleRequestDelete = (id) => {
    setCategoryToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    setCategoryToDelete(null);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteDoc(doc(db, 'categories', categoryToDelete));
    } catch (error) {
      console.error("Error deleting category: ", error);
    }
    // handleCloseConfirm() is called by the modal's onConfirm
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Category Management</h1>
      
      {/* Add/Edit Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        {/* --- MODIFIED: Changed to md:grid-cols-4 --- */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              placeholder="e.g., Microcontrollers"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="skuPrefix" className="block text-sm font-medium text-gray-700">SKU Prefix (3-4 letters)</label>
            <input
              type="text"
              id="skuPrefix"
              value={skuPrefix}
              onChange={(e) => setSkuPrefix(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              placeholder="e.g., MICR"
              maxLength="4"
              required
            />
          </div>
          
          {/* --- NEW: Icon Input Field --- */}
          <div className="md:col-span-1">
            <label htmlFor="icon" className="block text-sm font-medium text-gray-700">Icon Name (Heroicon)</label>
            <input
              type="text"
              id="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              placeholder="e.g., cpu-chip"
              required
            />
          </div>

          <div className="md:col-span-1 flex space-x-2">
            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-teal-700 transition"
            >
              {editingId ? 'Update Category' : 'Add Category'}
            </button>
            {editingId && (
              <button
                type="button"
                // --- MODIFIED: Add setIcon to reset ---
                onClick={() => { setEditingId(null); setCategoryName(''); setSkuPrefix(''); setIcon(''); }}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Category List */}
      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU Prefix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Icon</th> {/* --- NEW: Table Header --- */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{cat.skuPrefix}</td>
                  {/* --- NEW: Table Data Cell --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{cat.icon}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleEdit(cat)} className="text-teal-600 hover:text-teal-900">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    {/* --- FIX: Use modal delete --- */}
                    <button onClick={() => handleRequestDelete(cat.id)} className="text-red-600 hover:text-red-900">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- FIX: Add ConfirmModal component --- */}
      <ConfirmModal
        open={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
      />
    </div>
  );
}

