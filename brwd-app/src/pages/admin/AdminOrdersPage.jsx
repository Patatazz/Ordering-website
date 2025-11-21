import React from 'react';

const AdminOrdersPage = ({ allOrders, updateOrderStatus, setCurrentPage, handleLogout }) => {
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
        <nav className="bg-white shadow-md px-4 md:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-3xl font-bold text-red-600">BRWD. Admin Dashboard</h1>
            <div className="flex gap-4">
              <button onClick={() => setCurrentPage('admin_menu')} className="text-red-600 hover:text-red-700 font-bold">Menu Editor</button>
              <button onClick={() => setCurrentPage('admin_sales')} className="text-red-600 hover:text-red-700 font-bold">Sales Report</button>
              <button onClick={() => setCurrentPage('admin_careers')} className="text-red-600 hover:text-red-700 font-bold">Careers</button>
              <button onClick={handleLogout} className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50">Logout</button>
            </div>
          </div>
        </nav>
        
        <main className="max-w-6xl mx-auto px-8 py-12">
          <h2 className="text-4xl font-bold text-red-700 mb-8">Live Customer Orders ({activeOrders.length} Active)</h2>
          
          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center"><p className="text-xl text-gray-600">No active orders found.</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {sortedOrders.map(order => ( 
                <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 border-4 border-transparent hover:border-amber-500 transition">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${getStatusColor(order.status)}`}>{order.status.toUpperCase()}</span>
                  <p className="text-sm font-semibold text-gray-800 mb-1">Customer ID: {order.userId.substring(0, 8)}...</p>
                  <p className="text-xs text-gray-500 mb-4">Order Time: {new Date(order.timestamp).toLocaleTimeString()}</p>
                  <div className="border-t pt-3 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-1"><span>{item.name}</span><span className="font-medium">₱{item.price}</span></div>
                    ))}
                  </div>
                  <p className="text-xl font-bold text-red-600 mb-4">Total: ₱{order.total}</p>
                  <div className="flex justify-between gap-2">
                    <button onClick={() => updateOrderStatus(order.userId, order.id, 'preparing')} disabled={order.status === 'preparing' || order.status === 'served' || order.status === 'completed'} className="flex-1 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:bg-gray-300">Preparing</button>
                    <button onClick={() => updateOrderStatus(order.userId, order.id, 'served')} disabled={order.status === 'served' || order.status === 'completed'} className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300">Served</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
};

export default AdminOrdersPage;