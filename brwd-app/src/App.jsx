import React, { useState, useEffect } from "react";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  update,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyBUDuV9eQxdsO3R5IjHbVWKtB0j7dy7y58",
  authDomain: "brwd-dc4f5.firebaseapp.com",
  databaseURL:
    "https://brwd-dc4f5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "brwd-dc4f5",
  storageBucket: "brwd-dc4f5.firebasestorage.app",
  messagingSenderId: "742301970376",
  appId: "1:742301970376:web:83bea80e9fce927d9adafd",
  measurementId: "G-84HDZ3QW0P",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Product data
const products = {
  milktea: [
    {
      id: "mt1",
      name: "Classic Milk Tea",
      price: 85,
      category: "milktea",
      image: "🧋",
    },
    {
      id: "mt2",
      name: "Taro Milk Tea",
      price: 95,
      category: "milktea",
      image: "🧋",
    },
    {
      id: "mt3",
      name: "Matcha Milk Tea",
      price: 95,
      category: "milktea",
      image: "🧋",
    },
    {
      id: "mt4",
      name: "Chocolate Milk Tea",
      price: 90,
      category: "milktea",
      image: "🧋",
    },
    {
      id: "mt5",
      name: "Wintermelon Milk Tea",
      price: 85,
      category: "milktea",
      image: "🧋",
    },
    {
      id: "mt6",
      name: "Okinawa Milk Tea",
      price: 100,
      category: "milktea",
      image: "🧋",
    },
  ],
  fruittea: [
    {
      id: "ft1",
      name: "Lemon Fruit Tea",
      price: 80,
      category: "fruittea",
      image: "🍋",
    },
    {
      id: "ft2",
      name: "Passion Fruit Tea",
      price: 85,
      category: "fruittea",
      image: "🍊",
    },
    {
      id: "ft3",
      name: "Strawberry Fruit Tea",
      price: 90,
      category: "fruittea",
      image: "🍓",
    },
    {
      id: "ft4",
      name: "Mango Fruit Tea",
      price: 90,
      category: "fruittea",
      image: "🥭",
    },
    {
      id: "ft5",
      name: "Peach Fruit Tea",
      price: 85,
      category: "fruittea",
      image: "🍑",
    },
    {
      id: "ft6",
      name: "Lychee Fruit Tea",
      price: 95,
      category: "fruittea",
      image: "🍒",
    },
  ],
};

const App = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [pendingReview, setPendingReview] = useState(null);

  useEffect(() => {
    // Listen for reviews
    const reviewsRef = ref(database, "reviews");
    onValue(reviewsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reviewsList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setReviews(reviewsList);
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
          const ordersList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setOrders(ordersList);
        }
      });
    }
  }, [user]);

  const handleLogin = async (email, password, asAdmin) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(userCredential.user);
      setIsAdmin(asAdmin);
      setCurrentPage("menu");
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  const handleSignup = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(userCredential.user);
      setIsAdmin(false);
      setCurrentPage("menu");
    } catch (error) {
      alert("Signup failed: " + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
    setCurrentPage("home");
    setCart([]);
  };

  const addToCart = (product) => {
    setCart([
      ...cart,
      { ...product, size: "regular", sweetness: "100%", ice: "normal" },
    ]);
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;

    const orderRef = push(ref(database, `orders/${user.uid}`));
    const order = {
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price, 0),
      timestamp: Date.now(),
      status: "pending",
      completed: false,
    };

    await set(orderRef, order);
    setCart([]);
    alert("Order placed successfully!");
    setCurrentPage("menu");
  };

  const markOrderComplete = async (orderId) => {
    const orderRef = ref(database, `orders/${user.uid}/${orderId}`);
    await update(orderRef, { completed: true, status: "completed" });

    const order = orders.find((o) => o.id === orderId);
    setPendingReview(order);
    setCurrentPage("review");
  };

  const submitReview = async (orderId, rating, comment) => {
    const order = orders.find((o) => o.id === orderId);

    for (const item of order.items) {
      const reviewRef = push(ref(database, "reviews"));
      await set(reviewRef, {
        userId: user.uid,
        productId: item.id,
        productName: item.name,
        rating: rating,
        comment: comment,
        timestamp: Date.now(),
      });
    }

    setPendingReview(null);
    alert("Review submitted! Thank you for your feedback.");
    setCurrentPage("feedback");
  };

  // Page Components
  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col">
      <nav className="bg-white shadow-md px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-4xl font-bold text-amber-600">brwd.</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentPage("login")}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
            >
              Log In
            </button>
            <button
              onClick={() => setCurrentPage("signup")}
              className="px-6 py-2 border-2 border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-8">
        <div className="text-center">
          <h2 className="text-6xl font-bold text-amber-700 mb-4">
            Welcome to brwd.
          </h2>
          <p className="text-2xl text-amber-600 mb-8">
            Your favorite milk tea & fruit tea destination
          </p>
          <div className="text-8xl mb-8">🧋</div>
          <button
            onClick={() => setCurrentPage("menu")}
            className="px-8 py-4 bg-amber-500 text-white text-xl rounded-lg hover:bg-amber-600 transition shadow-lg"
          >
            View Menu
          </button>
        </div>
      </main>
    </div>
  );

  const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userType, setUserType] = useState("user");

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <button
            onClick={() => setCurrentPage("home")}
            className="text-amber-600 mb-4 hover:text-amber-700"
          >
            ← Back to Home
          </button>
          <h2 className="text-3xl font-bold text-amber-700 mb-6 text-center">
            Log In
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Login as
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="user"
                    checked={userType === "user"}
                    onChange={(e) => setUserType(e.target.value)}
                    className="mr-2"
                  />
                  User
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="admin"
                    checked={userType === "admin"}
                    onChange={(e) => setUserType(e.target.value)}
                    className="mr-2"
                  />
                  Admin
                </label>
              </div>
            </div>

            <button
              onClick={() => handleLogin(email, password, userType === "admin")}
              className="w-full py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SignupPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = () => {
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      handleSignup(email, password);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <button
            onClick={() => setCurrentPage("home")}
            className="text-amber-600 mb-4 hover:text-amber-700"
          >
            ← Back to Home
          </button>
          <h2 className="text-3xl font-bold text-amber-700 mb-6 text-center">
            Sign Up
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
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
          <h1 className="text-3xl font-bold text-amber-600">brwd.</h1>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <button
                  onClick={() => setCurrentPage("orders")}
                  className="px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                >
                  My Orders
                </button>
                <button
                  onClick={() => setCurrentPage("feedback")}
                  className="px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                >
                  Feedback
                </button>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCurrentPage("order")}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 relative"
                  >
                    Cart ({cart.length})
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <button
                onClick={() => setCurrentPage("login")}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <h2 className="text-4xl font-bold text-amber-700 mb-8">Our Menu</h2>

        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-amber-600 mb-6">
            Milk Tea
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.milktea.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="text-6xl mb-4 text-center">{product.image}</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                  {product.name}
                </h4>
                <p className="text-2xl font-bold text-amber-600 mb-4">
                  ₱{product.price}
                </p>
                <button
                  onClick={() => {
                    if (user) {
                      addToCart(product);
                      alert("Added to cart!");
                    } else {
                      alert("Please log in to order");
                      setCurrentPage("login");
                    }
                  }}
                  className="w-full py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-amber-600 mb-6">
            Fruit Tea
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.fruittea.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="text-6xl mb-4 text-center">{product.image}</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                  {product.name}
                </h4>
                <p className="text-2xl font-bold text-amber-600 mb-4">
                  ₱{product.price}
                </p>
                <button
                  onClick={() => {
                    if (user) {
                      addToCart(product);
                      alert("Added to cart!");
                    } else {
                      alert("Please log in to order");
                      setCurrentPage("login");
                    }
                  }}
                  className="w-full py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                >
                  Add to Cart
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
          <h1 className="text-3xl font-bold text-amber-600">brwd.</h1>
          <button
            onClick={() => setCurrentPage("menu")}
            className="text-amber-600 hover:text-amber-700"
          >
            ← Back to Menu
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-8 py-12">
        <h2 className="text-4xl font-bold text-amber-700 mb-8">Your Order</h2>

        {cart.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
            <button
              onClick={() => setCurrentPage("menu")}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {cart.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-4 border-b"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{item.image}</span>
                  <div>
                    <h4 className="font-semibold text-lg">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.size} | {item.sweetness} | {item.ice} ice
                    </p>
                  </div>
                </div>
                <p className="text-xl font-bold text-amber-600">
                  ₱{item.price}
                </p>
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

  const OrdersPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <nav className="bg-white shadow-md px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-amber-600">brwd.</h1>
          <button
            onClick={() => setCurrentPage("menu")}
            className="text-amber-600 hover:text-amber-700"
          >
            ← Back to Menu
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-8 py-12">
        <h2 className="text-4xl font-bold text-amber-700 mb-8">My Orders</h2>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Order Date:{" "}
                      {new Date(order.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-semibold text-amber-600">
                      {order.status}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    ₱{order.total}
                  </p>
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

  const ReviewPage = () => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <nav className="bg-white shadow-md px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-3xl font-bold text-amber-600">brwd.</h1>
            <button
              onClick={() => setCurrentPage("menu")}
              className="text-amber-600 hover:text-amber-700"
            >
              Skip Review
            </button>
          </div>
        </nav>

        <main className="max-w-2xl mx-auto px-8 py-12">
          <h2 className="text-4xl font-bold text-amber-700 mb-8">
            Review Your Order
          </h2>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="text-4xl"
                  >
                    {star <= rating ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Your Feedback
              </label>
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

  const FeedbackPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <nav className="bg-white shadow-md px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-amber-600">brwd.</h1>
          <button
            onClick={() => setCurrentPage("menu")}
            className="text-amber-600 hover:text-amber-700"
          >
            ← Back to Menu
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-8 py-12">
        <h2 className="text-4xl font-bold text-amber-700 mb-8">
          Customer Feedback
        </h2>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-xl font-semibold text-gray-800">
                    {review.productName}
                  </h4>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-xl">
                        {i < review.rating ? "⭐" : "☆"}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{review.comment}</p>
                <p className="text-sm text-gray-500">
                  {new Date(review.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );

  // Page Router
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "login":
        return <LoginPage />;
      case "signup":
        return <SignupPage />;
      case "menu":
        return <MenuPage />;
      case "order":
        return <OrderPage />;
      case "orders":
        return <OrdersPage />;
      case "review":
        return <ReviewPage />;
      case "feedback":
        return <FeedbackPage />;
      default:
        return <HomePage />;
    }
  };

  return renderPage();
};

export default App;
