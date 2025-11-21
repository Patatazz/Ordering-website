import React from 'react';

const HomePage = ({ setCurrentPage }) => (
  <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col">
    <nav className="bg-white shadow-md px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-4xl font-bold text-amber-600">BRWD.</h1>
        <div className="flex gap-4">
          <button onClick={() => setCurrentPage('login')} className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition">Log In</button>
          <button onClick={() => setCurrentPage('signup')} className="px-6 py-2 border-2 border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition">Sign Up</button>
        </div>
      </div>
    </nav>
    <main className="relative flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: 'url(/image/Pages/SignupPage.png)', minHeight: '100vh' }}>
      <div className="absolute inset-0 backdrop-blur-[3px]"></div>
      <div className="relative text-center z-10 p-8 rounded-2xl bg-white bg-opacity-80 shadow-2xl backdrop-blur-sm"> 
        <h2 className="text-4xl md:text-6xl font-bold text-amber-700 mb-4 text-center">Welcome to BRWD.</h2>
        <p className="text-lg md:text-2xl text-amber-600 mb-8 text-center">Your favorite milk tea & fruit tea destination</p>
        <div className="flex justify-center gap-6">
          <button onClick={() => setCurrentPage('menu')} className="px-8 py-4 bg-amber-500 text-white text-xl rounded-lg hover:bg-amber-600 transition shadow-lg">View Menu</button>
          <button onClick={() => setCurrentPage('careers')} className="px-8 py-4 border-2 border-amber-500 text-amber-600 text-xl rounded-lg hover:bg-amber-50 transition shadow-lg">Careers</button>
        </div>
      </div>
    </main>
  </div>
);

export default HomePage;