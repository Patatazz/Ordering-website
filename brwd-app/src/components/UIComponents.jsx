import React from 'react';

export const ErrorModal = ({ error, onClose }) => {
  if (!error) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm transform transition-all">
        <h3 className="text-2xl font-bold text-red-600 mb-4">Error</h3>
        <p className="text-gray-700 mb-6">{error}</p>
        <button onClick={onClose} className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold">OK</button>
      </div>
    </div>
  );
};

export const SuccessModal = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm transform transition-all">
        <h3 className="text-2xl font-bold text-green-600 mb-4">Success!</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <button onClick={onClose} className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold">Awesome!</button>
      </div>
    </div>
  );
};

export const Toast = ({ message }) => {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 transition-opacity duration-300">
      <div className="bg-green-500 text-white rounded-lg shadow-xl p-4 flex items-center gap-3">
        <span className="text-xl">✅</span>
        <p className="font-semibold">{message}</p>
      </div>
    </div>
  );
};

export const OrderSuccessModal = ({ isOpen, onNavigate }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all">
        <h3 className="text-2xl font-bold text-green-600 mb-4 text-center">Order Confirmed!</h3>
        <p className="text-gray-700 mb-8 text-center">Your order has been placed successfully. Where would you like to go now?</p>
        <div className="flex justify-around gap-4">
          <button onClick={() => onNavigate('orders')} className="flex-1 py-3 bg-amber-500 text-white 
          rounded-lg hover:bg-amber-600 transition font-semibold">Go to My Orders</button>
          <button onClick={() => onNavigate('menu')} className="flex-1 py-3 border-2 border-amber-500 
          text-amber-600 rounded-lg hover:bg-amber-50 transition font-semibold">Keep Browsing</button>
        </div>
      </div>
    </div>
  );
};