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
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" 
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 
                            0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 
                            0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 
                            0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
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