import React from 'react';

const OrderPage = ({ cart, placeOrder, setCurrentPage, removeFromCart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <nav className="bg-white shadow-md px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-600">BRWD.</h1>
          <button 
            onClick={() => setCurrentPage('menu')} 
            className="text-sm md:text-base text-amber-600 hover:text-amber-700 font-medium"
          >
            ← Back to Menu
          </button>
        </div>
      </nav>
      
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <h2 className="text-3xl md:text-4xl font-bold text-amber-700 mb-6 md:mb-8 text-center md:text-left">Your Order</h2>
        
        {cart.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center">
            <p className="text-lg md:text-xl text-gray-600 mb-4">Your cart is empty</p>
            <button 
                onClick={() => setCurrentPage('menu')} 
                className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
            >
                Browse Menu
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-8">
            <div className="space-y-4">
                {cart.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b last:border-0 gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-md bg-gray-50 border" 
                        />
                        <div>
                            <h4 className="font-semibold text-base md:text-lg text-gray-800">{item.name}</h4>
                            <p className="text-xs md:text-sm text-gray-600">
                                {item.size} | {item.sweetness} | {item.ice} ice
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-20 sm:pl-0">
                        <p className="text-lg md:text-xl font-bold text-amber-600">₱{item.price}</p>
                        
                        <button 
                            onClick={() => removeFromCart(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition"
                            title="Remove item"
                        >
                            <img 
                                src="/image/icon-trash.svg" 
                                alt="Delete" 
                                className="w-6 h-6 md:w-7 md:h-7"
                            />
                        </button>
                    </div>
                </div>
                ))}
            </div>
            <div className="mt-6 pt-6 border-t bg-gray-50 -mx-4 -mb-4 p-4 md:bg-transparent md:p-0 md:mx-0 md:mb-0 rounded-b-xl">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <span className="text-xl md:text-2xl font-bold text-gray-700">Total Amount</span>
                <span className="text-3xl md:text-4xl font-bold text-amber-600">₱{cart.reduce((sum, item) => sum + item.price, 0)}</span>
              </div>
              <button 
                onClick={placeOrder} 
                className="w-full py-3 md:py-4 bg-amber-500 text-white text-lg md:text-xl rounded-lg hover:bg-amber-600 transition font-semibold shadow-md"
              >
                Place Order
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderPage;