import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { CpuChipIcon, TagIcon, SparklesIcon, InboxIcon } from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    // Mock categories (you can fetch from Firestore later)
    setCategories([
      { name: 'Microcontrollers', icon: CpuChipIcon, link: '/products?category=Microcontrollers' },
      { name: 'Sensors', icon: TagIcon, link: '/products?category=Sensors' },
      { name: 'Components', icon: SparklesIcon, link: '/products?category=Components' },
      { name: 'All Products', icon: InboxIcon, link: '/products' },
    ]);

    // Fetch featured products
    const fetchFeatured = async () => {
      try {
        const q = query(
          collection(db, 'products'), 
          where('stockQuantity', '>', 0),
          orderBy('name') 
        );
        const querySnapshot = await getDocs(q);
        setFeatured(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching featured products: ", error);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-teal-600 text-white rounded-lg p-12 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-4xl font-bold mb-4">Build Your Next Big Idea</h1>
          <p className="text-lg text-teal-100 mb-6">High-quality, affordable electronics for makers and professionals.</p>
          <Link to="/products" className="bg-white text-teal-600 font-bold py-3 px-6 rounded-md hover:bg-gray-100 transition">
            Shop All Products
          </Link>
        </div>
        <div className="hidden md:block">
          <CpuChipIcon className="h-40 w-40 text-teal-300 opacity-50" />
        </div>
      </section>

      {/* Category Grid (duino.lk style) */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link key={cat.name} to={cat.link} className="group block p-6 bg-white rounded-lg shadow-md text-center hover:shadow-xl hover:scale-105 transition">
              <cat.icon className="h-12 w-12 text-teal-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 group-hover:text-teal-600">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featured.length > 0 ? (
            featured.map(product => <ProductCard key={product.id} product={product} />)
          ) : (
            <p>Loading products...</p>
          )}
        </div>
      </section>
    </div>
  );
}


