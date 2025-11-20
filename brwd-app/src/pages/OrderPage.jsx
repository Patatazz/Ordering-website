import React from 'react';

const OrderPage = ({ cart, placeOrder, setCurrentPage }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <nav className="bg-white shadow-md px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-amber-600">BRWD.</h1>
          <button onClick={() => setCurrentPage('menu')} className="text-amber-600 hover:text-amber-700">← Back to Menu</button>
        </div>
      </nav>
      
      <main className="max-w-4xl mx-auto px-8 py-12">
        <h2 className="text-4xl font-bold text-amber-700 mb-8">Your Order</h2>
        
        {cart.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
            <button onClick={() => setCurrentPage('menu')} className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600">Browse Menu</button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {cart.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-4 border-b">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded-md bg-gray-50" />
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
                <span className="text-3xl font-bold text-amber-600">₱{cart.reduce((sum, item) => sum + item.price, 0)}</span>
              </div>
              <button onClick={placeOrder} className="w-full py-4 bg-amber-500 text-white text-xl rounded-lg hover:bg-amber-600 transition font-semibold">Place Order</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderPage;