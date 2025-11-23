import React, { useState } from 'react';

const LoginPage = ({ handleLogin, handleGoogleLogin, setCurrentPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user');

  const baseClasses = "min-h-screen flex items-center justify-center px-4 transition-all duration-500";
  const backgroundClasses = userType === 'user' ? 'bg-gradient-to-br from-amber-50 to-orange-100' : 'bg-[#FDF4E6]'; 
  const adminLayoutClasses = userType === 'admin' ? 'md:justify-around gap-8 p-0' : ''; 

  return (
    <div className={`${baseClasses} ${backgroundClasses} ${adminLayoutClasses}`}>
      {userType === 'admin' && (
        <div className="flex-1 min-h-screen hidden md:flex items-center justify-center relative overflow-hidden p-8 transition-opacity duration-500 opacity-100">
          <img src="/image/Pages/admin.jpg" alt="Admin Login Background" className="object-contain h-full w-full max-w-lg md:max-w-2xl lg:max-w-3xl shadow-2xl"/>
          <div className="absolute top-10 center text-amber-700 text-4xl font-bold drop-shadow-lg">Hello, Admin.</div>
        </div>
      )}

      <div className={`bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10 transition-all duration-500 
      ${userType === 'admin' ? 'md:flex-shrink-0 md:w-1/2 md:max-w-lg md:px-12 md:py-16' : ''}`}>
        <button onClick={() => setCurrentPage('home')} className="text-amber-600 mb-4 hover:text-amber-700">← Back to Home</button>
        <h2 className="text-4xl font-bold text-amber-700 mb-6 text-center">Log In</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500" placeholder="your@email.com"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500" placeholder="••••••••"/>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Login as</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button onClick={() => setUserType('user')} 
              className={`flex-1 py-2 text-center rounded-lg font-medium transition-colors duration-200 
              ${userType === 'user' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-600 hover:bg-white'}`}>
                User
              </button>
              <button onClick={() => setUserType('admin')} 
              className={`flex-1 py-2 text-center rounded-lg font-medium transition-colors duration-200 
              ${userType === 'admin' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-600 hover:bg-white'}`}>
                Admin
              </button>
            </div>
          </div>
          <button onClick={() => handleLogin(email, password, userType === 'admin')} 
          className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold">
            Log In
          </button>

          {userType === 'user' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
              </div>
              <button onClick={handleGoogleLogin} 
              className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold flex items-center justify-center gap-3">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />Sign in with Google
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;