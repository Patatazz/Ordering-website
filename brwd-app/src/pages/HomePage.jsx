import React from 'react';

const HomePage = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-48 h-48 md:w-72 md:h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-10 w-48 h-48 md:w-72 md:h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-20 w-48 h-48 md:w-72 md:h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      <main className="relative z-10 max-w-4xl mx-auto p-6 md:p-8 text-center">
        <h2 className="text-4xl md:text-6xl font-extrabold text-amber-800 mb-4 leading-tight drop-shadow-sm">
          Welcome to <span className="text-amber-600">BRWD.</span>
        </h2>
        <p className="text-lg md:text-2xl text-amber-700 mb-10 font-medium max-w-xl mx-auto leading-relaxed">
          Your favorite destination for premium milk tea & refreshing fruit tea experiences.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
          <button 
            onClick={() => setCurrentPage('login')} 
            className="w-full sm:w-auto px-8 py-3 bg-amber-600 text-white text-lg rounded-full hover:bg-amber-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
          >
            Login
          </button>
          <button 
            onClick={() => setCurrentPage('signup')} 
            className="w-full sm:w-auto px-8 py-3 bg-white text-amber-600 text-lg border-2 border-amber-600 rounded-full hover:bg-amber-50 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-semibold"
          >
            Create Account
          </button>
        </div>
        <p className="mt-12 text-amber-800 font-medium flex items-center justify-center gap-2 opacity-80">
            <span className="text-xl">🧋</span> By the BRWD. Team
        </p>
      </main>
    </div>
  );
};

export default HomePage;