import React from 'react';

const HomePage = ({ setCurrentPage }) => (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 to-orange-100">
    <nav className="bg-white shadow-md px-4 md:px-8 py-4 relative z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl md:text-4xl font-bold text-amber-600">BRWD.</h1>
        <div className="flex gap-3 md:gap-4">
          <button 
            onClick={() => setCurrentPage('login')} 
            className="px-4 py-2 md:px-6 md:py-2 bg-amber-500 text-white text-sm md:text-base rounded-lg hover:bg-amber-600 transition"
          >
            Log In
          </button>
          <button 
            onClick={() => setCurrentPage('signup')} 
            className="px-4 py-2 md:px-6 md:py-2 border-2 border-amber-500 text-amber-600 text-sm md:text-base rounded-lg hover:bg-amber-50 transition"
          >
            Sign Up
          </button>
        </div>
      </div>
    </nav>
    <main 
        className="relative flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-contain bg-center bg-no-repeat" 
        style={{ 
            backgroundImage: 'url(/image/Pages/SignupPage.png)', 
            minHeight: 'calc(100vh - 80px)'
        }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      <div className="relative text-center z-10 p-6 md:p-10 rounded-2xl bg-white/90 shadow-2xl backdrop-blur-sm max-w-2xl w-full mx-4"> 
        <h2 className="text-4xl md:text-6xl font-bold text-amber-700 mb-4">Welcome to BRWD.</h2>
        <p className="text-lg md:text-2xl text-amber-600 mb-8">Your favorite milk tea & fruit tea destination</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
          <button 
            onClick={() => setCurrentPage('menu')} 
            className="w-full sm:w-auto px-8 py-3 md:py-4 bg-amber-500 text-white text-lg md:text-xl rounded-lg hover:bg-amber-600 transition shadow-lg font-semibold"
          >
            View Menu
          </button>
          <button 
            onClick={() => setCurrentPage('careers')} 
            className="w-full sm:w-auto px-8 py-3 md:py-4 border-2 border-amber-500 text-amber-600 text-lg 
            md:text-xl rounded-lg hover:bg-amber-50 transition shadow-lg font-semibold"
          >
            Careers
          </button>
        </div>
      </div>
    </main>
  </div>
);

export default HomePage;