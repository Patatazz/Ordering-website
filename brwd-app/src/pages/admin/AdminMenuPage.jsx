import React, { useState } from 'react';

const AdminMenuPage = ({ products, updateProductPrice, toggleSoldOut, setErrorModal, setCurrentPage, handleLogout }) => {
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
        <div className="flex items-center gap-4 mb-2">
            <img src={product.image} alt={product.name} className="w-16 h-16 object-contain bg-white rounded-md border" />
            <div>
                <h4 className="text-xl font-bold text-amber-800">{product.name}</h4>
                <p className="text-sm text-gray-600">Current: ₱{product.price}</p>
            </div>
        </div>
        <label className="block text-sm font-medium text-gray-700">New Price (₱)</label>
        <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" placeholder="e.g., 145"/>
        <div className="flex gap-2 mt-3">
            <button onClick={() => handlePriceChange(product)} className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Save</button>
            <button onClick={() => setEditingProduct(null)} className="flex-1 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Cancel</button>
        </div>
      </div>
    );

    const renderProductCard = (product) => (
        <div key={product.id} className="bg-white rounded-xl shadow-lg p-6 space-y-3 border-4 border-transparent hover:border-red-500 transition">
            <img src={product.image} alt={product.name} className="block w-32 h-32 object-contain mx-auto mb-4 bg-gray-50 rounded-lg" />
            <h4 className="text-xl font-semibold text-gray-800">{product.name}</h4>
            <p className="text-2xl font-bold text-red-600">₱{product.price}</p>
            <div className="flex gap-2 pt-3 border-t">
                <button onClick={() => toggleSoldOut(product.category, product)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition 
                ${product.soldOut ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                  {product.soldOut ? 'Mark Available' : 'Mark Sold Out'}
                </button>
                <button onClick={() => { setEditingProduct(product); setNewPrice(product.price.toString()); }} className="flex-1 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600">Edit Price</button>
            </div>
        </div>
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <nav className="bg-white shadow-md px-4 md:px-8 py-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-red-600 text-center">BRWD. Admin Menu</h1>
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 w-full md:w-auto">
              <button onClick={() => setCurrentPage('admin_orders')} className="text-sm md:text-base text-red-600 hover:text-red-700 font-bold px-2">
                Dashboard
              </button>
              <button onClick={() => setCurrentPage('admin_sales')} className="text-sm md:text-base text-red-600 hover:text-red-700 font-bold px-2">
                Sales
              </button>
              <button onClick={() => setCurrentPage('admin_careers')} className="text-sm md:text-base text-red-600 hover:text-red-700 font-bold px-2">
                Careers
              </button>
              <button onClick={handleLogout} className="text-sm md:text-base px-3 py-1 md:px-4 md:py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50">
                Logout
              </button>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-8 py-12">
          <h2 className="text-4xl font-bold text-red-700 mb-8">Manage Products & Pricing</h2>

          {/* Milktea */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-amber-700 mb-6">Milktea</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.milktea.map(product => (editingProduct && editingProduct.id === product.id ? renderProductEdit(product) : renderProductCard(product)))}
            </div>
          </div>

          {/* Fruittea */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-amber-700 mb-6">Fruit Tea</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.fruittea.map(product => (editingProduct && editingProduct.id === product.id ? renderProductEdit(product) : renderProductCard(product)))}
            </div>
          </div>
        
          {/* Fruitmilk */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-amber-700 mb-6">Fruit Milk</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.fruitmilk.map(product => (editingProduct && editingProduct.id === product.id ? renderProductEdit(product) : renderProductCard(product)))}
            </div>
          </div>

          {/* Iced Coffee */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-amber-700 mb-6">Iced Coffee</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.icedcoffee.map(product => (editingProduct && editingProduct.id === product.id ? renderProductEdit(product) : renderProductCard(product)))}
            </div>
          </div>

          {/* Frappe */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-amber-700 mb-6">Frappe</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.frappe.map(product => (editingProduct && editingProduct.id === product.id ? renderProductEdit(product) : renderProductCard(product)))}
            </div>
          </div>
        </main>
      </div>
    );
};

export default AdminMenuPage;