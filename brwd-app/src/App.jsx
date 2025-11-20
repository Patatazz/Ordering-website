import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, onValue, update, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: "G-84HDZ3QW0P" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Product data
const products = {
  milktea: [
    { id: 'mt1', name: 'Classic Milk Tea', price: 110, category: 'milktea', image: '🧋' },
    { id: 'mt2', name: 'Taro Milk Tea', price: 125, category: 'milktea', image: '🧋' },
    { id: 'mt3', name: 'Wintermelon Milk Tea', price: 115, category: 'milktea', image: '🧋' },
    { id: 'mt4', name: 'Hokkaido Milk Tea', price: 130, category: 'milktea', image: '🧋' },
    { id: 'mt5', name: 'Okinawa Milk Tea', price: 130, category: 'milktea', image: '🧋' },
    { id: 'mt6', name: 'Chocolate Milk Tea', price: 120, category: 'milktea', image: '🧋' },
  ],
  fruittea: [
    { id: 'ft1', name: 'Lemon Fruit Tea', price: 80, category: 'fruittea', image: '🍋' },
    { id: 'ft2', name: 'Passion Fruit Tea', price: 85, category: 'fruittea', image: '🍊' },
    { id: 'ft3', name: 'Strawberry Fruit Tea', price: 90, category: 'fruittea', image: '🍓' },
    { id: 'ft4', name: 'Mango Fruit Tea', price: 90, category: 'fruittea', image: '🥭' },
    { id: 'ft5', name: 'Peach Fruit Tea', price: 85, category: 'fruittea', image: '🍑' },
    { id: 'ft6', name: 'Lychee Fruit Tea', price: 95, category: 'fruittea', image: '🍒' },
  ]
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [pendingReview, setPendingReview] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [orderPlacedModal, setOrderPlacedModal] = useState(false);
  const [applications, setApplications] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [dailySales, setDailySales] = useState({});
  const [products, setProducts] = useState({ milktea: [], fruittea: [] });

  useEffect(() => {
    // Listen for reviews
    const reviewsRef = ref(database, 'reviews');
    onValue(reviewsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reviewsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setReviews(reviewsList); 
      } else {
        setReviews([]);
      }
    });
  }, []);

  useEffect(() => {
    // Listen for user orders
    if (user) {
      const ordersRef = ref(database, `orders/${user.uid}`); 
      
      onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
          const ordersList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setOrders(ordersList);
        } else {
          setOrders([]);
        }
      });
    } else {
      setOrders([]);
    }
  }, [user]);

  useEffect(() => {
    const productsRef = ref(database, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const processedProducts = {
          milktea: data.milktea ? Object.keys(data.milktea).map(key => ({ id: key, ...data.milktea[key] })) : [],
          fruittea: data.fruittea ? Object.keys(data.fruittea).map(key => ({ id: key, ...data.fruittea[key] })) : [],
        };
        setProducts(processedProducts);
      } else {
        setProducts({ milktea: [], fruittea: [] });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};

    if (user && isAdmin) {
      const allOrdersRef = ref(database, 'orders'); 

      unsubscribe = onValue(allOrdersRef, (snapshot) => { 
        const usersOrders = snapshot.val();
        
        if (usersOrders) {
          const flattenedOrders = [];
          const salesSummary = {};

          Object.keys(usersOrders).forEach(userId => {
            const userOrderData = usersOrders[userId];

            if (userOrderData) {
              Object.keys(userOrderData).forEach(orderId => {
                const order = {
                  id: orderId,
                  userId: userId,
                  ...userOrderData[orderId]
                };
                
                flattenedOrders.push(order);
                
                if (order.completed) {
                  const dateKey = new Date(order.timestamp).toISOString().split('T')[0];
                  
                  if (!salesSummary[dateKey]) {
                    salesSummary[dateKey] = { totalSales: 0, orderCount: 0, orders: [] };
                  }
                  
                  salesSummary[dateKey].totalSales += order.total;
                  salesSummary[dateKey].orderCount += 1;
                  salesSummary[dateKey].orders.push(order);
                }
              });
            }
          });
          setAllOrders(flattenedOrders);
          setDailySales(salesSummary);
          
        } else {
          setAllOrders([]);
          setDailySales({});
        }
      });

      return () => {
        unsubscribe();
        setAllOrders([]); 
        setDailySales({});
      };
      
    } else {
      setAllOrders([]);
      setDailySales({});
    }
  }, [user, isAdmin]);

  useEffect(() => {
    let unsubscribe = () => {};

    if (user && isAdmin) {
      const applicationsRef = ref(database, 'applications');
      unsubscribe = onValue(applicationsRef, (snapshot) => { 
        const data = snapshot.val();
        
        if (data) {
          const applicationsList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setApplications(applicationsList); 
        } else {
          setApplications([]);
        }
      });
      return () => {
        unsubscribe();
        setApplications([]); 
      };
      
    } else {
      setApplications([]);
    }
  }, [user, isAdmin]); 

  const updateOrderStatus = async (userId, orderId, newStatus) => {
    const orderRef = ref(database, `orders/${userId}/${orderId}`);
    const isServed = newStatus === 'served';

    await update(orderRef, { 
        status: newStatus,
        completed: isServed ? false : false
    });
  };

  const toggleSoldOut = async (category, product) => {
    const productRef = ref(database, `products/${category}/${product.id}`);
    await update(productRef, { soldOut: !product.soldOut });
    setToastMessage(`Status for ${product.name} updated.`);
  };

  const updateProductPrice = async (category, productId, newPrice) => {

    const productRef = ref(database, `products/${category}/${productId}`);
    const finalPrice = parseFloat(newPrice); 
    
    await update(productRef, { price: finalPrice }); 
    setToastMessage(`Price for ${productId} updated to ₱${finalPrice}`);
  };

  const ErrorModal = () => {
    if (!errorModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm transform transition-all">
          <h3 className="text-2xl font-bold text-red-600 mb-4">Error</h3>
          
          <p className="text-gray-700 mb-6">{errorModal}</p>
          
          <button
            onClick={() => setErrorModal(null)}
            className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
          >
            OK
          </button>
        </div>
      </div>
    );
  };

  const SuccessModal = () => {
    if (!successModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm transform transition-all">
          <h3 className="text-2xl font-bold text-green-600 mb-4">Success!</h3>
          
          <p className="text-gray-700 mb-6">{successModal}</p>
          
          <button
            onClick={() => setSuccessModal(null)}
            className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
          >
            Awesome!
          </button>
        </div>
      </div>
    );
  };

  const OrderSuccessModal = () => {
    if (!orderPlacedModal) return null;

    const handleNavigation = (page) => {
      setOrderPlacedModal(false);
      setCurrentPage(page);     
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all">
          <h3 className="text-2xl font-bold text-green-600 mb-4 text-center">Order Confirmed!</h3>
          
          <p className="text-gray-700 mb-8 text-center">
            Your order has been placed successfully. Where would you like to go now?
          </p>
          
          <div className="flex justify-around gap-4">
            <button
              onClick={() => handleNavigation('orders')}
              className="flex-1 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
            >
              Go to My Orders
            </button>

            <button
              onClick={() => handleNavigation('menu')}
              className="flex-1 py-3 border-2 border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition font-semibold"
            >
              Keep Browsing
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Toast = () => {
    if (!toastMessage) return null; // Don't render if no message

    return (
      <div className="fixed bottom-6 right-6 z-50 transition-opacity duration-300">
        <div className="bg-green-500 text-white rounded-lg shadow-xl p-4 flex items-center gap-3">
          <span className="text-xl">✅</span>
          <p className="font-semibold">{toastMessage}</p>
        </div>
      </div>
    );
  };

  const checkAdminStatus = async (uid) => {
    const adminRef = ref(database, `admins/${uid}`);
    const snapshot = await get(adminRef);

    if (snapshot.exists() && snapshot.val() === true) {
      return true;
    }
    return false;
  };

  const handleLogin = async (email, password, asAdmin) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userUid = userCredential.user.uid;
      let finalIsAdmin = false;

      if (asAdmin) {
        const isAdminUser = await checkAdminStatus(userUid);
        
        if (!isAdminUser) {

          setErrorModal('Account is not registered as admin.');
          await signOut(auth); 
          return;
        }
        finalIsAdmin = true; 
      }
      setIsAdmin(finalIsAdmin);
      setUser(userCredential.user);
      setCurrentPage(finalIsAdmin ? 'admin_menu' : 'menu');

    } catch (error) {
      setErrorModal('Login failed: No account found with provided credentials.');
    }
  };

  const uploadResume = async (file, applicantName) => {
    if (!file) return null;

    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Resume file must be less than 2MB');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          base64Data: reader.result,
          uploadDate: Date.now()
        });
      };
      
      reader.onerror = (error) => reject(error);
      
      reader.readAsDataURL(file);
    });
  };

  const handleSignup = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setIsAdmin(false);
      setCurrentPage('menu');
    } catch (error) {
      setErrorModal('Signup failed: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
    setCurrentPage('home');
    setCart([]);
  };

  const addToCart = (product) => {
    setCart([...cart, { ...product, size: 'regular', sweetness: '100%', ice: 'normal' }]);
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    
    const orderRef = push(ref(database, `orders/${user.uid}`));
    const order = {
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price, 0),
      timestamp: Date.now(),
      status: 'pending',
      completed: false
    };
    
    await set(orderRef, order);
    setCart([]);
    
    setOrderPlacedModal(true); 
  };

  const markOrderComplete = async (orderId) => {
    const orderToComplete = orders.find(o => o.id === orderId);
    if (orderToComplete.status !== 'served') {
      setErrorModal(`Cannot complete order. Status must be 'served' first.`);
      return;
    }
    
    const orderRef = ref(database, `orders/${user.uid}/${orderId}`);
    await update(orderRef, { completed: true, status: 'completed' });
    
    const order = orders.find(o => o.id === orderId);
    setPendingReview(order);
    setCurrentPage('review');
  };

  const submitApplication = async (data) => {
    try {
      const resumeData = await uploadResume(data.resume, data.name);
      
      const applicationRecord = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        resume: resumeData,
        timestamp: Date.now(),
        status: 'new'
      };

      const applicationRef = push(ref(database, 'applications'));
      await set(applicationRef, applicationRecord);

      setSuccessModal('Application successfully submitted! We will be in touch soon.');

    } catch (error) {
      console.error('Application error:', error);
      setErrorModal('Application submission failed: ' + error.message);
    }
  };

  const submitReview = async (orderId, rating, comment) => {
    const order = orders.find(o => o.id === orderId);
    
    for (const item of order.items) {
      const reviewRef = push(ref(database, 'reviews'));
      await set(reviewRef, {
        userId: user.uid,
        productId: item.id,
        productName: item.name,
        rating: rating,
        comment: comment,
        timestamp: Date.now()
      });
    }
    
    setPendingReview(null);
    setSuccessModal('Review successfully submitted! Thank you for your valuable feedback.');
    setCurrentPage('feedback');
  };

  // Page Components
  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col">
      <nav className="bg-white shadow-md px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-4xl font-bold text-amber-600">BRWD.</h1>
          <div className="flex gap-4">
            <button onClick={() => setCurrentPage('login')} className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition">
              Log In
            </button>
            <button onClick={() => setCurrentPage('signup')} className="px-6 py-2 border-2 border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition">
              Sign Up
            </button>
          </div>
        </div>
      </nav>
      
      <main 
            className="relative flex-1 flex flex-col items-center justify-center p-8 bg-contain bg-center bg-no-repeat" 
            style={{ 
              backgroundImage: 'url(/image/Pages/SignupPage.png)', 
              minHeight: '100vh', 
            }}
      >
        <div className="absolute inset-0 backdrop-blur-[3px]"></div>
        <div className="relative text-center z-10 p-8 rounded-2xl bg-white bg-opacity-80 shadow-2xl backdrop-blur-sm"> 
          <h2 className="text-6xl font-bold text-amber-700 mb-4">Welcome to BRWD.</h2>
          <p className="text-2xl text-amber-600 mb-8">Your favorite milk tea & fruit tea destination</p>
          <div className="flex justify-center gap-6">
            <button onClick={() => setCurrentPage('menu')} className="px-8 py-4 bg-amber-500 text-white text-xl rounded-lg hover:bg-amber-600 transition shadow-lg">
              View Menu
            </button>
            <button onClick={() => setCurrentPage('careers')} className="px-8 py-4 border-2 border-amber-500 text-amber-600 text-xl rounded-lg hover:bg-amber-50 transition shadow-lg">
              Careers
            </button>
          </div>
        </div>
      </main>
    </div>
  );

  const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('user');

    const baseClasses = "min-h-screen flex items-center justify-center px-4 transition-all duration-500";
    const backgroundClasses = 'bg-gradient-to-br from-amber-50 to-orange-100'; 

    const adminLayoutClasses = userType === 'admin' ? 'md:justify-around gap-8 p-0' : ''; 

    return (
      <div 
        className={`${baseClasses} ${backgroundClasses} ${adminLayoutClasses}`}
      >
        
        {userType === 'admin' && (
          <div className="flex-1 min-h-screen hidden md:flex items-center justify-center relative overflow-hidden p-8 transition-opacity duration-500 opacity-100">
            <img 
              src="/image/Pages/admin.jpg"
              alt="Admin Login Background" 
              className="object-contain h-full w-full max-w-lg md:max-w-2xl lg:max-w-3xl"
            />
            <div className="absolute top-10 center text-amber-700 text-4xl font-bold drop-shadow-lg">
                Hello, Admin.
            </div>
          </div>
        )}

        <div 
          className={`bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10 transition-all duration-500 
                      ${userType === 'admin' ? 'md:flex-shrink-0 md:w-1/2 md:max-w-lg md:px-12 md:py-16' : ''}`
          }
        >
          <button onClick={() => setCurrentPage('home')} className="text-amber-600 mb-4 hover:text-amber-700">
            ← Back to Home
          </button>
          
          <h2 className="text-4xl font-bold text-amber-700 mb-6 text-center">Log In</h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Login as</label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setUserType('user')}
                  className={`flex-1 py-2 text-center rounded-lg font-medium transition-colors duration-200 
                    ${userType === 'user' 
                      ? 'bg-amber-500 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-white'}`
                  }
                >
                  User
                </button>
                <button
                  onClick={() => setUserType('admin')}
                  className={`flex-1 py-2 text-center rounded-lg font-medium transition-colors duration-200 
                    ${userType === 'admin' 
                      ? 'bg-amber-500 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-white'}`
                  }
                >
                  Admin
                </button>
              </div>
            </div>

            <button
              onClick={() => handleLogin(email, password, userType === 'admin')}
              className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = () => {
      if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      handleSignup(email, password);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <button onClick={() => setCurrentPage('home')} className="text-amber-600 mb-4 hover:text-amber-700">
            ← Back to Home
          </button>
          <h2 className="text-3xl font-bold text-amber-700 mb-6 text-center">Sign Up</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  };

  const MenuPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <nav className="bg-white shadow-md px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-amber-600">BRWD.</h1>
          <div className="flex items-center gap-4">
            {user && (
              <>
                {isAdmin ? (
                   <button onClick={() => setCurrentPage('admin_orders')} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-bold">
                     Dashboard
                   </button>
                ) : (
                   <button onClick={() => setCurrentPage('orders')} className="px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg">
                     My Orders
                   </button>
                )}
                <button onClick={() => setCurrentPage('feedback')} className="px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg">
                  Feedback
                </button>
                {cart.length > 0 && (
                  <button onClick={() => setCurrentPage('order')} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 relative">
                    Cart ({cart.length})
                  </button>
                )}
                <button onClick={handleLogout} className="px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50">
                  Logout
                </button>
              </>
            )}
            {!user && (
              <button onClick={() => setCurrentPage('login')} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
                Log In
              </button>
            )}
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-8 py-12">
        <h2 className="text-4xl font-bold text-amber-700 mb-8">Our Menu</h2>
        
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-amber-600 mb-6">Milktea</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.milktea.map(product => (
              <div 
                key={product.id} 
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105 cursor-pointer relative"
              >
                {product.soldOut && (
                    <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl z-10">
                        SOLD OUT
                    </span>
                )}
                <div className="text-6xl mb-4 text-center">{product.image}</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h4>
                <p className="text-2xl font-bold text-amber-600 mb-4">₱{product.price}</p>
                <button
                  onClick={() => {
                    if (user) {
                      if (product.soldOut) {
                        setErrorModal(`${product.name} is currently sold out.`);
                        return;
                      }
                      addToCart(product);
                      setToastMessage(`${product.name} added to your cart!`); 
                      setTimeout(() => setToastMessage(null), 3000);
                    } else {
                      setErrorModal('Please log in to order.');
                      setCurrentPage('login');
                    }
                  }}
                  disabled={product.soldOut}
                  className="w-full py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {product.soldOut ? 'Sold Out' : 'Add to Cart'}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-2xl font-semibold text-amber-600 mb-6">Fruit Tea</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.fruittea.map(product => (
              <div 
                key={product.id} 
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105 cursor-pointer relative"
              >
                {product.soldOut && (
                    <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl z-10">
                        SOLD OUT
                    </span>
                )}
                <div className="text-6xl mb-4 text-center">{product.image}</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h4>
                <p className="text-2xl font-bold text-amber-600 mb-4">₱{product.price}</p>
                <button
                  onClick={() => {
                    if (user) {
                      if (product.soldOut) {
                        setErrorModal(`${product.name} is currently sold out.`);
                        return;
                      }
                      addToCart(product);
                      setToastMessage(`${product.name} added to your cart!`); 
                      setTimeout(() => setToastMessage(null), 3000);
                    } else {
                      setErrorModal('Please log in to order.');
                      setCurrentPage('login');
                    }
                  }}
                  disabled={product.soldOut}
                  className="w-full py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {product.soldOut ? 'Sold Out' : 'Add to Cart'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );

  const OrderPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <nav className="bg-white shadow-md px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-amber-600">BRWD.</h1>
          <button onClick={() => setCurrentPage('menu')} className="text-amber-600 hover:text-amber-700">
            ← Back to Menu
          </button>
        </div>
      </nav>
      
      <main className="max-w-4xl mx-auto px-8 py-12">
        <h2 className="text-4xl font-bold text-amber-700 mb-8">Your Order</h2>
        
        {cart.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
            <button onClick={() => setCurrentPage('menu')} className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {cart.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-4 border-b">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{item.image}</span>
                  <div>
                    <h4 className="font-semibold text-lg">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.size} | {item.sweetness} | {item.ice} ice</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-amber-600">₱{item.price}</p>
              </div>
            ))}
            
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center mb-6">
                <span className="text-2xl font-bold">Total:</span>
                <span className="text-3xl font-bold text-amber-600">
                  ₱{cart.reduce((sum, item) => sum + item.price, 0)}
                </span>
              </div>
              
              <button
                onClick={placeOrder}
                className="w-full py-4 bg-amber-500 text-white text-xl rounded-lg hover:bg-amber-600 transition font-semibold"
              >
                Place Order
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );

  const OrdersPage = () => {
    const sortedOrders = [...orders].sort((a, b) => b.timestamp - a.timestamp);

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <nav className="bg-white shadow-md px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-3xl font-bold text-amber-600">brwd.</h1>
            <button onClick={() => setCurrentPage('menu')} className="text-amber-600 hover:text-amber-700">
              ← Back to Menu
            </button>
          </div>
        </nav>
        
        <main className="max-w-4xl mx-auto px-8 py-12">
          <h2 className="text-4xl font-bold text-amber-700 mb-8">My Orders</h2>

          {sortedOrders.length === 0 ? ( 
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-xl text-gray-600">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedOrders.map(order => ( 
                <div key={order.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Order Date: {new Date(order.timestamp).toLocaleDateString()}</p>
                      <p className="text-sm font-semibold text-amber-600">{order.status}</p>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">₱{order.total}</p>
                  </div>
                  
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-2 border-t">
                      <span className="text-2xl mr-2">{item.image}</span>
                      {item.name}
                    </div>
                  ))}
                  
                  {!order.completed && (
                    <button
                      onClick={() => markOrderComplete(order.id)}
                      className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      Mark as Complete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  };

  const ReviewPage = () => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <nav className="bg-white shadow-md px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-3xl font-bold text-amber-600">BRWD.</h1>
            <button onClick={() => setCurrentPage('menu')} className="text-amber-600 hover:text-amber-700">
              Skip Review
            </button>
          </div>
        </nav>
        
        <main className="max-w-2xl mx-auto px-8 py-12">
          <h2 className="text-4xl font-bold text-amber-700 mb-8">Review Your Order</h2>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 mb-3">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="text-4xl"
                  >
                    {star <= rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 mb-3">Your Feedback</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                rows="5"
                placeholder="Tell us about your experience..."
              />
            </div>
            
            <button
              onClick={() => submitReview(pendingReview.id, rating, comment)}
              className="w-full py-4 bg-amber-500 text-white text-xl rounded-lg hover:bg-amber-600 transition font-semibold"
            >
              Submit Review
            </button>
          </div>
        </main>
      </div>
    );
  };

  const CareersPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [position, setPosition] = useState('Barista');
    const [resume, setResume] = useState(null);

    const availableCareers = ['Barista', 'Shift Leader', 'Kitchen Staff', 'Marketing Associate'];

   const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!resume) {
          setErrorModal("Please upload your resume to apply.");
          return;
      }

      if (isSubmitting) return;
      
      setIsSubmitting(true);
      
      try {
        await submitApplication({ name, email, phone, position, resume });

        setName('');
        setEmail('');
        setPhone('');
        setPosition('Barista');
        setResume(null);

        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
          
      } catch (error) {
        console.error('Submit error:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <nav className="bg-white shadow-md px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-3xl font-bold text-amber-600">BRWD. Careers</h1>
            <button onClick={() => setCurrentPage('home')} className="text-amber-600 hover:text-amber-700">
              ← Back to Home
            </button>
          </div>
        </nav>
        
        <main className="max-w-4xl mx-auto px-8 py-12">
          <h2 className="text-4xl font-bold text-amber-700 mb-8 text-center">Join Our Team!</h2>

          <div className="bg-white rounded-xl shadow-2xl p-8 mb-10">
            <h3 className="text-2xl font-bold text-amber-600 mb-4">Available Positions</h3>
            
            <div className="space-y-4">
                {availableCareers.map(pos => (
                    <div key={pos} className="border-b pb-3">
                        <h4 className="font-semibold text-lg text-gray-800">{pos}</h4>
                        <p className="text-sm text-gray-600">
                            {pos === 'Barista' && 'Prepare and serve hot and cold beverages, maintain inventory, and ensure a clean environment.'}
                            {pos === 'Shift Leader' && 'Oversee daily operations, manage staff shifts, and handle customer issues. Requires 1+ year experience.'}
                            {pos === 'Kitchen Staff' && 'Assist in food preparation, maintain kitchen hygiene, and manage stock rotation.'}
                            {pos === 'Marketing Associate' && 'Develop and execute social media strategies and local marketing campaigns.'}
                        </p>
                    </div>
                ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl p-8 space-y-6">
            <h3 className="text-2xl font-bold text-amber-600 mb-4">Apply Now</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Applying For</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
              >
                {availableCareers.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Resume (PDF only)</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResume(e.target.files[0])}
                required
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-600 hover:file:bg-amber-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-amber-500 text-white text-xl rounded-lg hover:bg-amber-600 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </main>
      </div>
    );
  };

  const FeedbackPage = () => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productReviews, setProductReviews] = useState({});

    // Organize reviews by product
    useEffect(() => {
      const organized = {};
      reviews.forEach(review => {
        if (!organized[review.productId]) {
          organized[review.productId] = {
            productName: review.productName,
            reviews: []
          };
        }
        organized[review.productId].reviews.push(review);
      });
      setProductReviews(organized);
    }, [reviews]);

    const allProducts = [...products.milktea, ...products.fruittea];

    const getAverageRating = (productId) => {
      const product = productReviews[productId];
      if (!product || product.reviews.length === 0) return 0;
      const sum = product.reviews.reduce((acc, review) => acc + review.rating, 0);
      return (sum / product.reviews.length).toFixed(1);
    };

    const getReviewCount = (productId) => {
      return productReviews[productId]?.reviews.length || 0;
    };

    if (selectedProduct) {
      const product = allProducts.find(p => p.id === selectedProduct);
      const reviewData = productReviews[selectedProduct];

      return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
          <nav className="bg-white shadow-md px-8 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <h1 className="text-3xl font-bold text-amber-600">BRWD.</h1>
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="text-amber-600 hover:text-amber-700"
              >
                ← Back to All Products
              </button>
            </div>
          </nav>
          
          <main className="max-w-4xl mx-auto px-8 py-12">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="flex items-center gap-6">
                <div className="text-8xl">{product.image}</div>
                <div className="flex-1">
                  <h2 className="text-4xl font-bold text-amber-700 mb-2">{product.name}</h2>
                  <p className="text-3xl font-bold text-amber-600 mb-3">₱{product.price}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-2xl">
                          {i < Math.round(parseFloat(getAverageRating(selectedProduct))) ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="text-xl font-semibold text-gray-700">
                      {getAverageRating(selectedProduct)} ({getReviewCount(selectedProduct)} review{getReviewCount(selectedProduct) !== 1 ? 's' : ''})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-amber-700 mb-6">Customer Reviews</h3>
            {reviewData && reviewData.reviews.length > 0 ? (
              <div className="space-y-6">
                {reviewData.reviews
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map(review => (
                    <div key={review.id} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-xl">
                              {i < review.rating ? '⭐' : '☆'}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(review.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-xl text-gray-600">No reviews yet for this product</p>
              </div>
            )}
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <nav className="bg-white shadow-md px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-3xl font-bold text-amber-600">BRWD.</h1>
            <button onClick={() => setCurrentPage('menu')} className="text-amber-600 hover:text-amber-700">
              ← Back to Menu
            </button>
          </div>
        </nav>
        
        <main className="max-w-7xl mx-auto px-8 py-12">
          <h2 className="text-4xl font-bold text-amber-700 mb-4">Customer Feedback</h2>
          <p className="text-gray-600 mb-8">Click on any product to see detailed reviews</p>
          
   
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-amber-600 mb-6">Milktea</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.milktea.map(product => {
                const reviewCount = getReviewCount(product.id);
                const avgRating = getAverageRating(product.id);
                
                return (
                  <div 
                    key={product.id} 
                    onClick={() => setSelectedProduct(product.id)}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer transform hover:scale-105"
                  >
                    <div className="text-6xl mb-4 text-center">{product.image}</div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h4>
                    <p className="text-2xl font-bold text-amber-600 mb-3">₱{product.price}</p>
                    
                    {reviewCount > 0 ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className="text-lg">
                                {i < Math.round(parseFloat(avgRating)) ? '⭐' : '☆'}
                              </span>
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{avgRating}</span>
                        </div>
                        <p className="text-sm text-gray-600">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No reviews yet</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fruit Tea Section */}
          <div>
            <h3 className="text-2xl font-semibold text-amber-600 mb-6">Fruit Tea</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.fruittea.map(product => {
                const reviewCount = getReviewCount(product.id);
                const avgRating = getAverageRating(product.id);
                
                return (
                  <div 
                    key={product.id} 
                    onClick={() => setSelectedProduct(product.id)}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer transform hover:scale-105"
                  >
                    <div className="text-6xl mb-4 text-center">{product.image}</div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h4>
                    <p className="text-2xl font-bold text-amber-600 mb-3">₱{product.price}</p>
                    
                    {reviewCount > 0 ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className="text-lg">
                                {i < Math.round(parseFloat(avgRating)) ? '⭐' : '☆'}
                              </span>
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{avgRating}</span>
                        </div>
                        <p className="text-sm text-gray-600">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No reviews yet</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  };

  const AdminOrdersPage = () => {
    const activeOrders = allOrders.filter(order => !order.completed);
    const sortedOrders = [...activeOrders].sort((a, b) => {
      const statusOrder = (status) => {
        if (status === 'pending') return 1;
        if (status === 'preparing') return 2;
        if (status === 'served') return 3;
        return 4;
      };
      
      const statusComparison = statusOrder(a.status) - statusOrder(b.status);
      if (statusComparison !== 0) return statusComparison;
      
      return b.timestamp - a.timestamp;
    });

    const getStatusColor = (status) => {
      switch (status) {
        case 'pending': return 'bg-red-500 text-white';
        case 'preparing': return 'bg-yellow-500 text-gray-800';
        case 'served': return 'bg-blue-500 text-white';
        case 'completed': return 'bg-green-500 text-white';
        default: return 'bg-gray-300';
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <nav className="bg-white shadow-md px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-3xl font-bold text-red-600">BRWD. Admin Dashboard</h1>
            <div className="flex gap-4">
              <button onClick={() => setCurrentPage('admin_menu')} className="text-red-600 hover:text-red-700 font-bold">
                Menu Editor
              </button>
              <button onClick={() => setCurrentPage('admin_sales')} className="text-red-600 hover:text-red-700 font-bold">
                Sales Report
              </button>
              <button onClick={() => setCurrentPage('admin_careers')} className="text-red-600 hover:text-red-700 font-bold">
                Careers ({applications.length}) 
              </button>
              <button onClick={handleLogout} className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50">
                Logout
              </button>
            </div>
          </div>
        </nav>
        
        <main className="max-w-6xl mx-auto px-8 py-12">
          <h2 className="text-4xl font-bold text-red-700 mb-8">Live Customer Orders ({activeOrders.length} Active)</h2>
          
          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-xl text-gray-600">No active orders found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedOrders.map(order => ( 
                <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 border-4 border-transparent hover:border-amber-500 transition">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                  
                  <p className="text-sm font-semibold text-gray-800 mb-1">Customer ID: {order.userId.substring(0, 8)}...</p>
                  <p className="text-xs text-gray-500 mb-4">Order Time: {new Date(order.timestamp).toLocaleTimeString()}</p>

                  <div className="border-t pt-3 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-1">
                        <span>{item.name}</span>
                        <span className="font-medium">₱{item.price}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xl font-bold text-red-600 mb-4">Total: ₱{order.total}</p>

                  {/* Admin Action Buttons */}
                  <div className="flex justify-between gap-2">
                    <button
                      onClick={() => updateOrderStatus(order.userId, order.id, 'preparing')}
                      disabled={order.status === 'preparing' || order.status === 'served' || order.status === 'completed'}
                      className="flex-1 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:bg-gray-300"
                    >
                      Preparing
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.userId, order.id, 'served')}
                      disabled={order.status === 'served' || order.status === 'completed'}
                      className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300"
                    >
                      Served
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  };

  const AdminSalesReportPage = () => {
    const sortedDailyReports = Object.keys(dailySales)
      .map(date => ({ date, ...dailySales[date] }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const grandTotalSales = sortedDailyReports.reduce((sum, report) => sum + report.totalSales, 0);
    const grandTotalOrders = sortedDailyReports.reduce((sum, report) => sum + report.orderCount, 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <nav className="bg-white shadow-md px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-3xl font-bold text-red-600">Sales Report</h1>
            <div className="flex gap-4">
              <button onClick={() => setCurrentPage('admin_menu')} className="text-red-600 hover:text-red-700 font-bold">
                Menu Editor
              </button>
              <button onClick={() => setCurrentPage('admin_orders')} className="text-red-600 hover:text-red-700 font-bold">
                ← Back to Live Orders
              </button>
              <button onClick={handleLogout} className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50">
                Logout
              </button>
            </div>
          </div>
        </nav>
        
        <main className="max-w-6xl mx-auto px-8 py-12">
          <h2 className="text-4xl font-bold text-red-700 mb-8">Daily Sales Summary</h2>
          
          <div className="bg-red-600 text-white rounded-xl shadow-2xl p-6 mb-10 flex justify-around">
            <div className="text-center">
              <p className="text-sm opacity-80">Total Orders Tracked</p>
              <p className="text-4xl font-extrabold">{grandTotalOrders}</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-80">Grand Total Sales</p>
              <p className="text-4xl font-extrabold">₱{grandTotalSales.toFixed(2)}</p>
            </div>
          </div>

          {sortedDailyReports.length === 0 ? ( 
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-xl text-gray-600">No completed sales records found.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedDailyReports.map(report => ( 
                <div key={report.date} className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-2xl font-bold text-amber-700 border-b pb-3 mb-4">
                    Sales for {new Date(report.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h3>
                  
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-semibold text-gray-800">Total Revenue:</p>
                    <p className="text-3xl font-extrabold text-green-600">₱{report.totalSales.toFixed(2)}</p>
                  </div>
                  
                  <p className="text-sm text-gray-600">{report.orderCount} order{report.orderCount !== 1 ? 's' : ''} completed.</p>
                  
                  <details className="mt-4 pt-4 border-t">
                    <summary className="text-amber-600 cursor-pointer font-medium">View {report.orderCount} Orders</summary>
                    <ul className="mt-2 text-sm text-gray-700 space-y-1">
                      {report.orders.map(order => (
                        <li key={order.id} className="flex justify-between">
                          <span>Order #{order.id.substring(0, 8)}</span>
                          <span className="font-semibold">₱{order.total}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  };

  const AdminCareersPage = () => {
    const groupedApplications = applications.reduce((acc, app) => {
      if (!acc[app.position]) {
        acc[app.position] = [];
      }
      acc[app.position].push(app);
      return acc;
    }, {});
    
    const sortedPositions = Object.keys(groupedApplications).sort((a, b) => {
      return groupedApplications[b].length - groupedApplications[a].length;
    });

    const getStatusColor = (status) => {
      switch (status) {
        case 'new': return 'bg-yellow-500 text-gray-800';
        case 'reviewed': return 'bg-blue-500 text-white';
        case 'contacted': return 'bg-green-500 text-white';
        default: return 'bg-gray-300';
      }
    };

    const markReviewed = async (appId) => {
        const appRef = ref(database, `applications/${appId}`);
        await update(appRef, { status: 'reviewed' });
    };

    const markContacted = async (appId) => {
        const appRef = ref(database, `applications/${appId}`);
        await update(appRef, { status: 'contacted' });
    };

    const deleteApplication = async (appId) => {
        const appRef = ref(database, `applications/${appId}`);
        await set(appRef, null);
    };

    if (!isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-100">
          <p className="text-2xl text-red-600">Access Denied: Admin privileges required.</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <nav className="bg-white shadow-md px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-3xl font-bold text-red-600">BRWD. Applications</h1>
            <div className="flex gap-4">
              <button onClick={() => setCurrentPage('admin_menu')} className="text-red-600 hover:text-red-700 font-bold">
                Menu Editor
              </button>
              <button onClick={() => setCurrentPage('admin_orders')} className="text-red-600 hover:text-red-700 font-bold">
                Orders Dashboard
              </button>
              <button onClick={handleLogout} className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50">
                Logout
              </button>
            </div>
          </div>
        </nav>
        
        <main className="max-w-7xl mx-auto px-8 py-12">
          <h2 className="text-4xl font-bold text-red-700 mb-8">Job Applications ({applications.length} Total)</h2>
          
          {applications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-xl text-gray-600">No applications received yet.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {sortedPositions.map(position => (
                <div key={position}>
                  <h3 className="text-3xl font-bold text-amber-700 mb-6 border-b pb-2">
                    {position} ({groupedApplications[position].length} Applicants)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedApplications[position]
                       .sort((a, b) => b.timestamp - a.timestamp)
                       .map(app => (
                        <div key={app.id} className="bg-white rounded-xl shadow-lg p-6 space-y-3">
                          <div className="flex justify-between items-start">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(app.status)}`}>
                              {app.status.toUpperCase()}
                            </span>
                            <p className="text-xs text-gray-500">{new Date(app.timestamp).toLocaleDateString()}</p>
                          </div>

                          <p className="text-lg font-bold text-gray-900">{app.name}</p>
                          <p className="text-sm text-gray-600">Email: {app.email}</p>
                          <p className="text-sm text-gray-600">Phone: {app.phone}</p>

                          <div className="pt-3 border-t">
                            <a 
                              href={app.resume.resumeUrl} // Resume link is now stored directly in app.resume.resumeUrl
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:text-blue-900 underline font-medium block mb-3"
                            >
                              View Resume (PDF)
                            </a>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button onClick={() => markReviewed(app.id)} disabled={app.status === 'reviewed' || app.status === 'contacted'} className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:bg-gray-300">
                                    Mark Reviewed
                                </button>
                                <button onClick={() => markContacted(app.id)} disabled={app.status === 'contacted'} className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:bg-gray-300">
                                    Contacted
                                </button>
                                <button 
                                    onClick={() => deleteApplication(app.id)} 
                                    className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                                >
                                    Reject
                                </button>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  };

  const AdminMenuPage = () => {
    const [editingProduct, setEditingProduct] = useState(null);
    const [newPrice, setNewPrice] = useState('');

    const handlePriceChange = (product) => {
        if (newPrice === '' || isNaN(newPrice) || parseFloat(newPrice) <= 0) {
            setErrorModal("Please enter a valid price.");
            return;
        }
        updateProductPrice(product.category, product.id, newPrice); 
        setEditingProduct(null);
        setNewPrice('');
    };

    const renderProductEdit = (product) => (
      <div className="bg-amber-50 rounded-xl shadow-lg p-6 border-2 border-amber-600 space-y-3">
        <h4 className="text-xl font-bold text-amber-800">{product.name}</h4>
        <p className="text-sm">Current Price: ₱{product.price}</p>
        
        <label className="block text-sm font-medium text-gray-700">New Price (₱)</label>
        <input
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="e.g., 145"
        />
        <div className="flex gap-2 mt-3">
            <button onClick={() => handlePriceChange(product)} className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                Save
            </button>
            <button onClick={() => setEditingProduct(null)} className="flex-1 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                Cancel
            </button>
        </div>
      </div>
    );

    const renderProductCard = (product) => (
        <div key={product.id} className="bg-white rounded-xl shadow-lg p-6 space-y-3 border-4 border-transparent hover:border-red-500 transition">
            <div className="text-4xl text-center">{product.image}</div>
            <h4 className="text-xl font-semibold text-gray-800">{product.name}</h4>
            <p className="text-2xl font-bold text-red-600">₱{product.price}</p>
            
            <div className="flex gap-2 pt-3 border-t">
                <button
                    onClick={() => toggleSoldOut(product.category, product)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${product.soldOut ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
                >
                    {product.soldOut ? 'Mark Available' : 'Mark Sold Out'}
                </button>
                <button
                    onClick={() => { setEditingProduct(product); setNewPrice(product.price.toString()); }}
                    className="flex-1 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                >
                    Edit Price
                </button>
            </div>
        </div>
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <nav className="bg-white shadow-md px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-3xl font-bold text-red-600">BRWD. Admin Menu Editor</h1>
            <div className="flex gap-4">
              <button onClick={() => setCurrentPage('admin_orders')} className="text-red-600 hover:text-red-700 font-bold">
                Dashboard
              </button>
              <button onClick={handleLogout} className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50">
                Logout
              </button>
            </div>
          </div>
        </nav>
        
        <main className="max-w-7xl mx-auto px-8 py-12">
          <h2 className="text-4xl font-bold text-red-700 mb-8">Manage Products & Pricing</h2>
          
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-amber-700 mb-6">Milktea</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.milktea.map(product => (
                editingProduct && editingProduct.id === product.id ? 
                renderProductEdit(product) : 
                renderProductCard(product)
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold text-amber-700 mb-6">Fruit Tea</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.fruittea.map(product => (
                editingProduct && editingProduct.id === product.id ? 
                renderProductEdit(product) : 
                renderProductCard(product)
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  };

  // Page Router
  const renderPage = () => {
    switch(currentPage) {
      case 'home': return <HomePage />;
      case 'login': return <LoginPage />;
      case 'signup': return <SignupPage />;
      case 'menu': return <MenuPage />;
      case 'order': return <OrderPage />;
      case 'orders': return <OrdersPage />;
      case 'review': return <ReviewPage />;
      case 'feedback': return <FeedbackPage />;
      case 'careers': return <CareersPage />;
      case 'admin_orders': return <AdminOrdersPage />;
      case 'admin_sales': return <AdminSalesReportPage />;
      case 'admin_careers': return <AdminCareersPage />;
      case 'admin_menu': return <AdminMenuPage />;
      default: return <HomePage />;
    }
  };

  return (
    <>
      {renderPage()}
      <ErrorModal />
      <SuccessModal />
      <Toast />
      <OrderSuccessModal />
    </>
  );
};

export default App;