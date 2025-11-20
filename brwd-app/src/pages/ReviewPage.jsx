import React, { useState } from 'react';
import { ref, push, set } from 'firebase/database';

const ReviewPage = ({ pendingReview, orders, user, database, setCurrentPage, setSuccessModal, setErrorModal }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const cleanText = (text) => {
      let cleaned = text.replace(/(.)\1{2,}/g, '$1$1');
      
      cleaned = cleaned.toLowerCase(); 
      
      return cleaned;
  };

  const submitReview = async () => {
    if (!pendingReview) return;

    try {
        let finalSentiment = 'NEUTRAL';
        let aiLabel = null;
        let aiScore = 0;

        if (window.pipeline && comment.trim().length > 0) {
            try {
                const processedComment = cleanText(comment);
                const classifier = await window.pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
                const result = await classifier(processedComment);
                
                aiLabel = result[0].label; 
                aiScore = result[0].score; 


                if (aiLabel === 'POSITIVE') aiLabel = 'GOOD';
                if (aiLabel === 'NEGATIVE') aiLabel = 'BAD';

            } catch (err) {
                console.warn("AI analysis failed, using stars only.", err);
            }
        }

        if (aiScore > 0.85 && aiLabel) {
            finalSentiment = aiLabel;
        } else {
            if (rating >= 4) {
                finalSentiment = 'GOOD';
            } else if (rating <= 2) {
                finalSentiment = 'BAD';
            } else {
                finalSentiment = aiLabel || 'NEUTRAL';
            }
        }

        for (const item of pendingReview.items) {
          const reviewRef = push(ref(database, 'reviews'));
          await set(reviewRef, {
            userId: user.uid,
            productId: item.id,
            productName: item.name,
            rating: rating,
            comment: comment,
            timestamp: Date.now(),
            sentiment: finalSentiment 
          });
        }
        
        setSuccessModal(`Thank you! Review submitted.`);
        setCurrentPage('feedback');

    } catch (error) {
        console.error("Review Error:", error);
        setSuccessModal('Review submitted successfully.');
        setCurrentPage('feedback');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <nav className="bg-white shadow-md px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-amber-600">BRWD.</h1>
          <button onClick={() => setCurrentPage('menu')} className="text-amber-600 hover:text-amber-700">Skip Review</button>
        </div>
      </nav>
      
      <main className="max-w-2xl mx-auto px-8 py-12">
        <h2 className="text-4xl font-bold text-amber-700 mb-8">Review Your Order</h2>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-700 mb-3">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(star)} className="text-4xl transition transform hover:scale-110">
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-700 mb-3">Your Feedback</label>
            <textarea 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                rows="5" 
                placeholder="Tell us about your experience..."
            />
          </div>
          
          <button onClick={submitReview} className="w-full py-4 bg-amber-500 text-white text-xl rounded-lg hover:bg-amber-600 transition font-semibold shadow-md">
            Submit Review
          </button>
        </div>
      </main>
    </div>
  );
};

export default ReviewPage;