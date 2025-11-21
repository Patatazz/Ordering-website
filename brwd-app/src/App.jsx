import React, { useState, useEffect } from 'react';
import { ref, onValue, push, update, set, get } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { database, auth } from './config/firebase';
import { ErrorModal, SuccessModal, Toast, OrderSuccessModal } from './components/UIComponents';
import { Suspense, lazy } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const OrderPage = lazy(() => import('./pages/OrderPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminSalesReportPage = lazy(() => import('./pages/admin/AdminSalesReportPage'));
const AdminCareersPage = lazy(() => import('./pages/admin/AdminCareersPage'));
const AdminMenuPage = lazy(() => import('./pages/admin/AdminMenuPage'));

const App = () => {
  const [currentPage, setCurrentPage] = useState(localStorage.getItem('lastPage') || 'home');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState({ milktea: [], fruittea: [] });
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]); 
  const [reviews, setReviews] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [dailySales, setDailySales] = useState({});
  const [applications, setApplications] = useState([]);
  const [pendingReview, setPendingReview] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [orderPlacedModal, setOrderPlacedModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('lastPage', currentPage);
  }, [currentPage]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        const isAdminUser = await checkAdminStatus(currentUser.uid);
        setIsAdmin(isAdminUser);

        if (currentPage === 'login' || currentPage === 'signup' || currentPage === 'home') {
          setCurrentPage(isAdminUser ? 'admin_orders' : 'menu');
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        if (currentPage !== 'home' && currentPage !== 'login' && currentPage !== 'signup') {
          setCurrentPage('home');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


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
    const reviewsRef = ref(database, 'reviews');
    onValue(reviewsRef, (snapshot) => {
      const data = snapshot.val();
      setReviews(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
    });
  }, []);


  useEffect(() => {
    if (user) {
      const ordersRef = ref(database, `orders/${user.uid}`); 
      onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        setOrders(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
      });
    } else {
      setOrders([]);
    }
  }, [user]);


  useEffect(() => {
    let unsubscribeOrders = () => {};
    let unsubscribeApps = () => {};

    if (user && isAdmin) {
      const allOrdersRef = ref(database, 'orders'); 
      const appsRef = ref(database, 'applications');

      unsubscribeApps = onValue(appsRef, (snapshot) => { 
        const data = snapshot.val();
        setApplications(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
      });

      unsubscribeOrders = onValue(allOrdersRef, (snapshot) => { 
        const usersOrders = snapshot.val();
        if (usersOrders) {
          const flattenedOrders = [];
          const salesSummary = {};

          Object.keys(usersOrders).forEach(userId => {
            const userOrderData = usersOrders[userId];
            if (userOrderData) {
              Object.keys(userOrderData).forEach(orderId => {
                const order = { id: orderId, userId: userId, ...userOrderData[orderId] };
                flattenedOrders.push(order);
                
                if (order.completed) {
                  const dateKey = new Date(order.timestamp).toLocaleDateString('en-CA');
                  if (!salesSummary[dateKey]) salesSummary[dateKey] = { totalSales: 0, orderCount: 0, orders: [] };
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
        unsubscribeOrders(); 
        unsubscribeApps(); 
      };
    } else {
      setAllOrders([]); 
      setDailySales({}); 
      setApplications([]);
    }
  }, [user?.uid, isAdmin]);

  const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          <div className="text-2xl font-bold text-amber-600 animate-pulse">
            Loading...
          </div>
      </div>
    </div>
  );

  const handlePageChange = (newPage) => {
    if (newPage === currentPage) return;
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };


  const checkAdminStatus = async (uid) => {
    const adminRef = ref(database, `admins/${uid}`);
    const snapshot = await get(adminRef);
    return snapshot.exists() && snapshot.val() === true;
  };

  const handleLogin = async (email, password, asAdmin) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userUid = userCredential.user.uid;
      let finalIsAdmin = false;

      if (asAdmin) {
        const isAdminUser = await checkAdminStatus(userUid);
        if (!isAdminUser) { setErrorModal('Account is not registered as admin.'); await signOut(auth); return; }
        finalIsAdmin = true; 
      }
      setIsAdmin(finalIsAdmin);
      setUser(userCredential.user);
      setCurrentPage(finalIsAdmin ? 'admin_orders' : 'menu');
    } catch (error) { setErrorModal('Login failed: No account found.'); }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const isAdminUser = await checkAdminStatus(user.uid);
      setIsAdmin(isAdminUser);
      setUser(user);
      setCurrentPage(isAdminUser ? 'admin_orders' : 'menu');
    } catch (error) { 
      console.error(error);
      // console.error("FULL AUTH ERROR:", error.code, error.message);
      setErrorModal('Google Sign-In failed.'); 
    }
  };

  const handleSignup = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setIsAdmin(false);
      setCurrentPage('menu');
    } catch (error) { setErrorModal('Signup failed: ' + error.message); }
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

  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    const orderRef = push(ref(database, `orders/${user.uid}`));
    await set(orderRef, {
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price, 0),
      timestamp: Date.now(),
      status: 'pending',
      completed: false
    });
    setCart([]);
    setOrderPlacedModal(true); 
  };


  const updateOrderStatus = async (userId, orderId, newStatus) => {
    const orderRef = ref(database, `orders/${userId}/${orderId}`);
    const isServed = newStatus === 'served';
    await update(orderRef, { status: newStatus, completed: isServed ? false : false });
  };

  const toggleSoldOut = async (category, product) => {
    const productRef = ref(database, `products/${category}/${product.id}`);
    await update(productRef, { soldOut: !product.soldOut });
    setToastMessage(`Status for ${product.name} updated.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateProductPrice = async (category, productId, newPrice) => {
    const productRef = ref(database, `products/${category}/${productId}`);
    await update(productRef, { price: parseFloat(newPrice) }); 
    setToastMessage(`Price for ${productId} updated to ₱${newPrice}`);
    setTimeout(() => setToastMessage(null), 3000);
  };


  const uploadResume = async (file) => {
    if (!file) return null;
    if (file.size > 2 * 1024 * 1024) throw new Error('Resume file must be less than 2MB');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
          fileName: file.name, fileType: file.type, fileSize: file.size,
          data: reader.result, uploadDate: Date.now()
      });
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const submitApplication = async (data) => {
    const { setIsSubmitting, ...appData } = data; 
    try {
      let resumeData = null;
      if (appData.resume) resumeData = await uploadResume(appData.resume);
      
      const applicationRef = push(ref(database, 'applications'));
      await set(applicationRef, {
        ...appData,
        resume: resumeData,
        timestamp: Date.now(),
        status: 'new'
      });
      
      setSuccessModal('Application successfully submitted!');
      return true; 
    } catch (error) {
      setErrorModal('Application failed: ' + error.message);
      throw error; 
    } finally {
      if (setIsSubmitting) setIsSubmitting(false);
    }
  };

  const submitReview = async (orderId, rating, comment) => {
    try {
        const classifier = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
        const result = await classifier(comment);
        const rawLabel = result[0].label; 

        let sentiment = 'NEUTRAL';
        if (rawLabel === 'POSITIVE') sentiment = 'GOOD';
        if (rawLabel === 'NEGATIVE') sentiment = 'BAD';

        const order = orders.find(o => o.id === orderId);
        
        for (const item of order.items) {
          const reviewRef = push(ref(database, 'reviews'));
          await set(reviewRef, {
            userId: user.uid,
            productId: item.id,
            productName: item.name,
            rating: rating,
            comment: comment,
            timestamp: Date.now(),
            sentiment: sentiment 
          });
        }
        
        setPendingReview(null);
        setSuccessModal('Thank you! Your review has been submitted.');
        setCurrentPage('feedback');

    } catch (error) {
        console.error("AI Error:", error);
        setSuccessModal('Review submitted successfully.');
        setCurrentPage('feedback');
    }
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'home': 
        return <HomePage setCurrentPage={handlePageChange} />;
      case 'login': 
        return <LoginPage handleLogin={handleLogin} handleGoogleLogin={handleGoogleLogin} setCurrentPage={handlePageChange} />;
      case 'signup': 
        return <SignupPage handleSignup={handleSignup} setCurrentPage={handlePageChange} />;
      case 'menu': 
        return <MenuPage products={products} user={user} isAdmin={isAdmin} cart={cart} addToCart={addToCart} setCurrentPage={handlePageChange} handleLogout={handleLogout} setErrorModal={setErrorModal} setToastMessage={setToastMessage} />;
      case 'order': 
        return <OrderPage cart={cart} placeOrder={placeOrder} setCurrentPage={handlePageChange} removeFromCart={removeFromCart} />;
      case 'orders': 
        return <OrdersPage orders={orders} setCurrentPage={handlePageChange} user={user} database={database} setPendingReview={setPendingReview} setErrorModal={setErrorModal} />;
      case 'review': 
        return <ReviewPage pendingReview={pendingReview} orders={orders} user={user} database={database} setCurrentPage={handlePageChange} setSuccessModal={setSuccessModal} setErrorModal={setErrorModal} />;
      case 'feedback': 
        return <FeedbackPage products={products} reviews={reviews} setCurrentPage={handlePageChange} />;
      case 'careers': 
        return <CareersPage submitApplication={submitApplication} setSuccessModal={setSuccessModal} setErrorModal={setErrorModal} setCurrentPage={handlePageChange} />;
      case 'admin_orders': 
        return <AdminOrdersPage allOrders={allOrders} updateOrderStatus={updateOrderStatus} setCurrentPage={handlePageChange} handleLogout={handleLogout} />;
      case 'admin_sales': 
        return <AdminSalesReportPage dailySales={dailySales} setCurrentPage={handlePageChange} handleLogout={handleLogout} />;
      case 'admin_careers': 
        return <AdminCareersPage applications={applications} isAdmin={isAdmin} database={database} setCurrentPage={handlePageChange} handleLogout={handleLogout} />;
      case 'admin_menu': 
        return <AdminMenuPage products={products} updateProductPrice={updateProductPrice} toggleSoldOut={toggleSoldOut} setErrorModal={setErrorModal} setCurrentPage={handlePageChange} handleLogout={handleLogout} />;
      default: return <HomePage setCurrentPage={handlePageChange} />;
    }
  };

  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
         {loading ? <LoadingScreen /> : renderPage()}
      </Suspense>

      <ErrorModal error={errorModal} onClose={() => setErrorModal(null)} />
      <SuccessModal message={successModal} onClose={() => setSuccessModal(null)} />
      <Toast message={toastMessage} />
      <OrderSuccessModal isOpen={orderPlacedModal} onNavigate={(page) => { setOrderPlacedModal(false); handlePageChange(page); }} />
    </>
  );
};

export default App;
