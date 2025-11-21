import React, { useState, useEffect } from 'react';

const FeedbackPage = ({ products, reviews, setCurrentPage }) => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productReviews, setProductReviews] = useState({});
    const [filter, setFilter] = useState('ALL'); 

    useEffect(() => {
      setFilter('ALL');
    }, [selectedProduct]);
    
    useEffect(() => {
      const organized = {};
      reviews.forEach(review => {
        if (!organized[review.productId]) {
          organized[review.productId] = {
            productName: review.productName,
            reviews: [],
            goodCount: 0, 
            badCount: 0
          };
        }
        organized[review.productId].reviews.push(review);


        if (review.sentiment === 'GOOD') organized[review.productId].goodCount += 1;
        if (review.sentiment === 'BAD') organized[review.productId].badCount += 1;
      });
      setProductReviews(organized);
    }, [reviews]);

    const allProducts = [...products.milktea, ...products.fruittea];

    const getReviewCount = (productId) => {
      return productReviews[productId]?.reviews.length || 0;
    };

    const getSentimentStats = (productId) => {
        const data = productReviews[productId];
        if (!data) return { good: 0, bad: 0 };
        return { good: data.goodCount, bad: data.badCount };
    };

    if (selectedProduct) {
      const product = allProducts.find(p => p.id === selectedProduct);
      const reviewData = productReviews[selectedProduct];
      const stats = getSentimentStats(selectedProduct);

      const filteredReviews = reviewData ? reviewData.reviews.filter(review => {
        if (filter === 'ALL') return true;
        return review.sentiment === filter;
      }) : [];

      return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
          <nav className="bg-white shadow-md px-4 md:px-8 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold text-amber-600">BRWD.</h1>
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="text-sm md:text-base text-amber-600 hover:text-amber-700 font-medium"
              >
                ← Back
              </button>
            </div>
          </nav>
          
          <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-40 h-40 md:w-48 md:h-48 object-contain drop-shadow-xl" 
                />
                <div className="flex-1 text-center md:text-left w-full">
                  <h2 className="text-2xl md:text-4xl font-bold text-amber-700 mb-2">{product.name}</h2>
                  <p className="text-2xl md:text-3xl font-bold text-amber-600 mb-4">₱{product.price}</p>
                  <div className="flex flex-col gap-3 items-center md:items-start">
                    <span className="text-lg md:text-xl font-semibold text-gray-700">
                        {getReviewCount(selectedProduct)} Total Reviews
                    </span>
                    <div className="flex gap-3 justify-center md:justify-start">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full flex items-center gap-1">
                            👍 {stats.good} Positive
                        </span>
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full flex items-center gap-1">
                            👎 {stats.bad} Negative
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <h3 className="text-xl md:text-2xl font-bold text-amber-700">Customer Reviews</h3>
                <div className="flex bg-white rounded-lg shadow-sm p-1 gap-1 w-full md:w-auto justify-center">
                    <button onClick={() => setFilter('ALL')} className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition ${filter === 'ALL' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>All</button>
                    <button onClick={() => setFilter('GOOD')} className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition ${filter === 'GOOD' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-green-50'}`}>Positive</button>
                    <button onClick={() => setFilter('BAD')} className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition ${filter === 'BAD' ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-red-50'}`}>Negative</button>
                </div>
            </div>

            {filteredReviews.length > 0 ? (
              <div className="space-y-6">
                {filteredReviews.sort((a, b) => b.timestamp - a.timestamp).map(review => (
                    <div key={review.id} className="bg-white rounded-xl shadow-lg p-5 md:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                        <div className="flex items-center gap-3">
                            <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className="text-lg md:text-xl text-yellow-400">
                                {i < review.rating ? '⭐' : '☆'}
                                </span>
                            ))}
                            </div>    
                            {review.sentiment && review.sentiment !== 'NEUTRAL' && (
                                <span className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded uppercase ${review.sentiment === 'GOOD' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {review.sentiment === 'GOOD' ? 'Positive' : 'Negative'}
                                </span>
                            )}
                        </div>
                        <p className="text-xs md:text-sm text-gray-500">
                            {new Date(review.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm md:text-base">{review.comment}</p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-lg text-gray-600">{filter === 'ALL' ? 'No reviews yet for this product' : `No ${filter.toLowerCase()} reviews found`}</p>
              </div>
            )}
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <nav className="bg-white shadow-md px-4 md:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-amber-600">BRWD.</h1>
            <button onClick={() => setCurrentPage('menu')} className="text-sm md:text-base text-amber-600 hover:text-amber-700 font-medium">
              ← Back to Menu
            </button>
          </div>
        </nav>
        
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <h2 className="text-3xl md:text-4xl font-bold text-amber-700 mb-4 text-center md:text-left">Customer Feedback</h2>
          <p className="text-gray-600 mb-8 text-center md:text-left">Click on any product to see detailed reviews</p>
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-amber-600 mb-6">Milktea</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.milktea.map(product => {
                const stats = getSentimentStats(product.id);
                return (
                  <div key={product.id} onClick={() => setSelectedProduct(product.id)} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer transform hover:scale-105">
                    <img src={product.image} alt={product.name} className="w-32 h-32 object-contain mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-800 mb-2 text-center">{product.name}</h4>
                    <p className="text-2xl font-bold text-amber-600 mb-3 text-center">₱{product.price}</p>
                    <div className="flex gap-2 mt-2 justify-center">
                         <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">👍 {stats.good}</span>
                         <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">👎 {stats.bad}</span>
                    </div>  
                    <p className="text-sm text-gray-500 italic text-center mt-2">{getReviewCount(product.id)} reviews</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-amber-600 mb-6">Fruit Tea</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.fruittea.map(product => {
                const stats = getSentimentStats(product.id); 
                return (
                  <div key={product.id} onClick={() => setSelectedProduct(product.id)} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer transform hover:scale-105">
                    <img src={product.image} alt={product.name} className="w-32 h-32 object-contain mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-800 mb-2 text-center">{product.name}</h4>
                    <p className="text-2xl font-bold text-amber-600 mb-3 text-center">₱{product.price}</p>
                    <div className="flex gap-2 mt-2 justify-center">
                         <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">👍 {stats.good}</span>
                         <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">👎 {stats.bad}</span>
                    </div>
                    <p className="text-sm text-gray-500 italic text-center mt-2">{getReviewCount(product.id)} reviews</p>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
};

export default FeedbackPage;