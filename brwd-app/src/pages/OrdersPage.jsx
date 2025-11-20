import React from 'react';
import { ref, update } from 'firebase/database';

const OrdersPage = ({ orders, setCurrentPage, user, database, setPendingReview, setErrorModal }) => {
  const sortedOrders = [...orders].sort((a, b) => b.timestamp - a.timestamp);

  const markOrderComplete = async (orderId) => {
    const orderToComplete = orders.find(o => o.id === orderId);
    if (orderToComplete.status !== 'served') {
      setErrorModal(`Cannot complete order. Order is not yet served.`);
      return;
    }
    
    const orderRef = ref(database, `orders/${user.uid}/${orderId}`);
    await update(orderRef, { completed: true, status: 'completed' });
    
    const order = orders.find(o => o.id === orderId);
    setPendingReview(order);
    setCurrentPage('review');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <nav className="bg-white shadow-md px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-amber-600">brwd.</h1>
          <button onClick={() => setCurrentPage('menu')} className="text-amber-600 hover:text-amber-700">← Back to Menu</button>
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
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-contain inline-block mr-3" />
                    {item.name}
                  </div>
                ))}
                {!order.completed && (
                  <button onClick={() => markOrderComplete(order.id)} className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">Mark as Complete</button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;