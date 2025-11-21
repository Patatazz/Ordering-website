import React from 'react';

const AdminSalesReportPage = ({ dailySales, setCurrentPage, handleLogout }) => {
    const sortedDailyReports = Object.keys(dailySales)
      .map(date => ({ date, ...dailySales[date] }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const grandTotalSales = sortedDailyReports.reduce((sum, report) => sum + report.totalSales, 0);
    const grandTotalOrders = sortedDailyReports.reduce((sum, report) => sum + report.orderCount, 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <nav className="bg-white shadow-md px-4 md:px-8 py-4">
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
          
          <div className="bg-red-600 text-white rounded-xl shadow-2xl p-6 mb-10 flex flex-col md:flex-row gap-6 md:gap-0 justify-around items-center">
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

export default AdminSalesReportPage;