// best look
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { db, auth, googleProvider } from './firebaseConfig.js';
import { 
  collection, getDocs, doc, getDoc, addDoc, serverTimestamp, query, where, orderBy 
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { useCartStore } from './store.js';
import { 
  ShoppingCartIcon, UserIcon, ArrowLeftOnRectangleIcon, AcademicCapIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon, InboxIcon, SparklesIcon, CpuChipIcon 
} from '@heroicons/react/24/outline';

// This one file contains ALL components for your shop.
// As instructed in README.md, you should split each component
// (e.g., Navbar, HomePage, CartPage) into its own file.

// ====================================================================
// 0. Main App Component (Router)
// ====================================================================
export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Cleanup subscription
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/pages/" element={<HomePage.jsx />} /> 
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage user={user} />} />
          <Route path="/checkout" element={<CheckoutPage user={user} />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/my-account" element={<MyAccountPage user={user} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// ====================================================================
// 1. Layout Components (Navbar, Footer)
// ====================================================================
function Navbar({ user }) {
  const navigate = useNavigate();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-3xl font-bold text-primary">
              <SparklesIcon className="h-8 w-8 inline-block mr-2" />
              ElectroSense
            </Link>
          </div>

          {/* Search Bar (duino.lk style) */}
          <div className="hidden sm:flex flex-1 max-w-lg mx-4">
            <div className="relative w-full">
              <input
                type="search"
                placeholder="Search for Arduino, Sensors, ESP..."
                className="block w-full pl-4 pr-12 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <button className="absolute inset-y-0 right-0 flex items-center justify-center w-12 bg-primary text-white rounded-r-md hover:bg-primary-700">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Desktop Nav Icons */}
          <div className="hidden sm:flex sm:items-center sm:space-x-6">
            <Link to="/products" className="text-gray-600 hover:text-primary">
              All Products
            </Link>
            {user ? (
              <>
                <Link to="/my-account" className="flex items-center text-gray-600 hover:text-primary">
                  <UserIcon className="h-6 w-6 mr-1" />
                  My Account
                </Link>
                <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-primary">
                  <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth" className="flex items-center text-gray-600 hover:text-primary">
                <UserIcon className="h-6 w-6 mr-1" />
                Login
              </Link>
            )}
            <Link to="/cart" className="relative text-gray-600 hover:text-primary">
              <ShoppingCartIcon className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden px-2 pt-2 pb-3 space-y-1">
          <Link to="/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">All Products</Link>
          {user ? (
            <>
              <Link to="/my-account" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">My Account</Link>
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Logout</button>
            </>
          ) : (
            <Link to="/auth" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Login</Link>
          )}
          <Link to="/cart" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Cart ({totalItems})</Link>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">ElectroSense</h3>
            <p className="text-gray-400">Your #1 source for electronic components and project kits in Sri Lanka.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/products?category=Microcontrollers" className="hover:text-white">Microcontrollers</Link></li>
              <li><Link to="/products?category=Sensors" className="hover:text-white">Sensors</Link></li>
              <li><Link to="/products?category=Components" className="hover:text-white">Components</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/my-account" className="hover:text-white">My Account</Link></li>
              <li><Link to="/cart" className="hover:text-white">View Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: contact@electrosense.com</li>
              <li>Phone: +94 77 123 4567</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-gray-500">
          &copy; {new Date().getFullYear()} ElectroSense. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// ====================================================================
// 2. Page Components
// ====================================================================

function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch categories (mocked, you can fetch from Firestore)
    setCategories([
      { name: 'Microcontrollers', icon: CpuChipIcon, link: '/products?category=Microcontrollers' },
      { name: 'Sensors', icon: AcademicCapIcon, link: '/products?category=Sensors' },
      { name: 'Components', icon: SparklesIcon, link: '/products?category=Components' },
      { name: 'All Products', icon: InboxIcon, link: '/products' },
    ]);

    // Fetch featured products
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('name'), where('stockQuantity', '>', 0)); // Add a "featured" tag later
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
      <section className="bg-primary text-white rounded-lg p-12 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-4xl font-bold mb-4">Build Your Next Big Idea</h1>
          <p className="text-lg text-primary-100 mb-6">High-quality, affordable electronics for makers and professionals.</p>
          <Link to="/products" className="bg-white text-primary font-bold py-3 px-6 rounded-md hover:bg-gray-100 transition">
            Shop All Products
          </Link>
        </div>
        <div className="hidden md:block">
          <CpuChipIcon className="h-40 w-40 text-primary-300 opacity-50" />
        </div>
      </section>

      {/* Category Grid (duino.lk style) */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link key={cat.name} to={cat.link} className="group block p-6 bg-white rounded-lg shadow-md text-center hover:shadow-xl hover:scale-105 transition">
              <cat.icon className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 group-hover:text-primary">{cat.name}</h3>
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

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('stockQuantity', '>', 0), orderBy('name'));
        const querySnapshot = await getDocs(q);
        setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="flex">
      {/* Filters Sidebar */}
      <aside className="hidden md:block w-64 pr-8 space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Categories</h3>
        <ul className="space-y-2 text-gray-600">
          <li><a href="#" className="hover:text-primary">Microcontrollers</a></li>
          <li><a href="#" className="hover:text-primary">Sensors</a></li>
          <li><a href="#" className="hover:text-primary">Resistors</a></li>
          <li><a href="#" className="hover:text-primary">LEDs & Displays</a></li>
        </ul>
        <h3 className="text-xl font-semibold text-gray-800 pt-6 border-t">Filter by Price</h3>
        {/* Add price filter logic here */}
      </aside>

      {/* Product Grid */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">All Products</h1>
        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'products', id);
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
  }, [id]);

  if (loading) return <p>Loading product details...</p>;
  if (!product) return <p>Product not found.</p>;

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <img 
            src={product.imageUrl || 'https://placehold.co/600x600/0d9488/white?text=' + product.name} 
            alt={product.name}
            className="w-full rounded-lg object-cover"
          />
        </div>
        
        {/* Product Details */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-3xl font-semibold text-primary mb-6">LKR {product.price.toFixed(2)}</p>{/* </TKR> */}
          <p className="text-gray-600 mb-6">{product.description}</p>
          <span className="text-sm text-green-600 font-medium mb-4">
            {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of Stock'}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0}
            className="w-full bg-primary text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

function CartPage() {
  const cart = useCartStore((state) => state.cart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const totalPrice = useCartStore((state) => state.getTotalPrice());

  if (cart.length === 0) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="bg-primary text-white font-bold py-3 px-6 rounded-md hover:bg-primary-700 transition">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Cart</h1>
        <div className="space-y-6">
          {cart.map(item => (
            <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between border-b pb-6">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <img 
                  src={item.imageUrl || 'https://placehold.co/100x100/0d9488/white?text=Item'} 
                  alt={item.name}
                  className="w-20 h-20 rounded-md object-cover"
                />
                <div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-gray-600">LKR {item.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={(e) => updateQuantity(item.id, e.target.value)}
                  className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                />
                <p className="text-lg font-semibold w-24 text-right">
                  LKR {(item.price * item.quantity).toFixed(2)}
                </p>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <aside className="bg-white p-6 rounded-lg shadow-md h-fit">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-4">Order Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">LKR {totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="font-semibold">LKR 500.00</span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t pt-4">
            <span>Total</span>
            <span className="text-primary">LKR {(totalPrice + 500).toFixed(2)}</span>
          </div>
        </div>
        <Link to="/checkout" className="mt-6 w-full bg-primary text-white py-3 px-6 rounded-md text-lg font-semibold text-center block hover:bg-primary-700 transition">
          Proceed to Checkout
        </Link>
      </aside>
    </div>
  );
}

function CheckoutPage({ user }) {
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.cart);
  const totalPrice = useCartStore((state) => state.getTotalPrice());
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [formData, setFormData] = useState({ name: '', address: '', phone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/checkout'); // Redirect to login if not authenticated
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user || cart.length === 0) return;

    setLoading(true);
    try {
      // 1. Create the order document
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userName: formData.name,
        userEmail: user.email,
        address: formData.address,
        phone: formData.phone,
        items: cart,
        total: totalPrice + 500, // Include shipping
        status: "Pending",
        createdAt: serverTimestamp()
      });
      
      // 2. Clear the cart
      clearCart();

      // 3. Redirect to success page
      navigate('/order-success');

    } catch (error) {
      console.error("Error placing order: ", error);
      alert("Error placing order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Please log in to proceed.</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input type="text" name="name" id="name" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Shipping Address</label>
          <textarea name="address" id="address" rows="3" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"></textarea>
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input type="tel" name="phone" id="phone" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
        </div>
        
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Payment</h2>
          <p className="text-gray-600 bg-yellow-50 p-4 rounded-md">
            This is a **Bank Transfer** order. After placing the order, please transfer the total amount to the bank account details shown on the next page.
          </p>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400">
          {loading ? 'Placing Order...' : `Place Order (LKR ${(totalPrice + 500).toFixed(2)})`}
        </button>
      </form>
    </div>
  );
}

function OrderSuccessPage() {
  return (
    <div className="max-w-lg mx-auto text-center bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Order Placed Successfully!</h1>
      <p className="text-gray-700 mb-6">Thank you for your purchase. Your order is now pending payment.</p>
      
      <div className="bg-primary-50 p-6 rounded-lg text-left">
        <h2 className="text-xl font-semibold text-primary-900 mb-4">Bank Transfer Details</h2>
        <p className="text-gray-800">Please transfer the total amount to the account below:</p>
        <ul className="my-4 space-y-2 font-mono">
          <li><strong>Bank:</strong> Commercial Bank</li>
          <li><strong>Account Name:</strong> ElectroSense (Pvt) Ltd</li>
          <li><strong>Account Number:</strong> 1234 5678 90</li>
          <li><strong>Branch:</strong> Malabe</li>
        </ul>
        <p className="text-red-600 font-medium">**Important:** Please use your Order ID as the payment reference.</p>
      </div>
      
      <Link to="/" className="mt-8 inline-block bg-primary text-white font-bold py-3 px-6 rounded-md hover:bg-primary-700 transition">
        Back to Home
      </Link>
    </div>
  );
}

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create user doc in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: name,
          email: email,
          createdAt: serverTimestamp(),
          isAdmin: false // Default to not admin
        });
      }
      navigate('/my-account'); // Redirect after success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore, if not, create them
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          createdAt: serverTimestamp(),
          isAdmin: false
        });
      }
      navigate('/my-account');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        {isLogin ? 'Welcome Back!' : 'Create Account'}
      </h1>
      <form onSubmit={handleAuth} className="space-y-6">
        {!isLogin && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
        </div>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <button type="submit" disabled={loading} className="w-full bg-primary text-white py-2 px-4 rounded-md font-semibold hover:bg-primary-700 transition disabled:bg-gray-400">
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        
        <button onClick={handleGoogleSignIn} className="mt-6 w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M20 10.031C20 8.781 19.89 7.563 19.672 6.375h-9.672v3.656h5.484c-.234 1.188-.906 2.188-1.938 2.875v2.344h3.016c1.766-1.625 2.797-3.969 2.797-6.844z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M10 20c2.672 0 4.938-.875 6.578-2.375l-3.016-2.344c-.891.609-2.031.969-3.563.969-2.734 0-5.047-1.844-5.875-4.344H.984v2.422C2.625 18.109 6.031 20 10 20z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M4.125 12.188C3.891 11.563 3.75 10.813 3.75 10c0-.813.141-1.563.375-2.188V5.578H.984C.359 6.797 0 8.359 0 10c0 1.641.359 3.203.984 4.422l3.141-2.235z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M10 3.969c1.453 0 2.766.5 3.797 1.484l2.672-2.672C14.938 1.141 12.672 0 10 0 6.031 0 2.625 1.891.984 4.422l3.141 2.422C4.953 4.344 7.266 3.969 10 3.969z" clipRule="evenodd" />
          </svg>
          Sign in with Google
        </button>
      </div>
      
      <p className="mt-6 text-center text-sm text-gray-600">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-primary hover:text-primary-700 ml-1">
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </div>
  );
}

function MyAccountPage({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        try {
          setLoading(true);
          const q = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
          const querySnapshot = await getDocs(q);
          setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error("Error fetching orders: ", error);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [user]);
  
  if (!user) {
    return (
      <div className="text-center">
        <p>Please <Link to="/auth" className="text-primary underline">login</Link> to see your account.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Account</h1>
      <p className="text-xl text-gray-700 mb-8">Welcome back, <span className="font-semibold">{user.displayName || user.email}</span>!</p>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">My Order History</h2>
        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>You haven't placed any orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="border p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                    <p className="text-lg font-semibold">Total: LKR {order.total.toFixed(2)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// ====================================================================
// 3. Utility Components (ProductCard)
// ====================================================================

function ProductCard({ product }) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Stop event bubbling
    addToCart(product);
  };

  return (
    <Link to={`/products/${product.id}`} className="group bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-xl transition">
      <div className="h-48 overflow-hidden">
        <img 
          src={product.imageUrl || 'https://placehold.co/400x400/0d9488/white?text=' + product.name} 
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
          >
            <ShoppingCartIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </Link>
  );
}
