import React from 'react';

const MenuPage = ({ products, user, isAdmin, cart, addToCart, setCurrentPage, handleLogout, setErrorModal, setToastMessage }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <nav className="bg-white shadow-md px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
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
              <div key={product.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105 cursor-pointer relative">
                {product.soldOut && 
                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl z-10">
                  SOLD OUT
                </span>}
                <img src={product.image} alt={product.name} 
                className="w-40 h-40 object-contain mx-auto mb-4 drop-shadow-md hover:scale-110 transition-transform duration-300" />
                <h4 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h4>
                <p className="text-2xl font-bold text-amber-600 mb-4">₱{product.price}</p>
                <button
                  onClick={() => {
                    if (user) {
                      if (product.soldOut) { setErrorModal(`${product.name} is currently sold out.`); return; }
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
              <div key={product.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105 cursor-pointer relative">
                {product.soldOut && 
                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl z-10">
                  SOLD OUT
                </span>}
                <img src={product.image} alt={product.name} 
                className="w-40 h-40 object-contain mx-auto mb-4 drop-shadow-md hover:scale-110 transition-transform duration-300" />
                <h4 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h4>
                <p className="text-2xl font-bold text-amber-600 mb-4">₱{product.price}</p>
                <button
                  onClick={() => {
                    if (user) {
                      if (product.soldOut) { setErrorModal(`${product.name} is currently sold out.`); return; }
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
};

export default MenuPage;