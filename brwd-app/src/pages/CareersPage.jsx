import React, { useState } from 'react';

const CareersPage = ({ submitApplication, setCurrentPage, setErrorModal }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('Barista');
  const [resume, setResume] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableCareers = ['Barista', 'Shift Leader', 'Kitchen Staff', 'Marketing Associate'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !phone || !position) {
         setErrorModal("Please fill out all required personal fields.");
         return;
    }

    if (!resume) {
        setErrorModal("Please upload your resume to apply.");
        return;
    }
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await submitApplication({ name, email, phone, position, resume, setIsSubmitting }); 

      setName('');
      setEmail('');
      setPhone('');
      setPosition('Barista');
      setResume(null);
      
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Submit error:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-amber-800 items-center justify-center relative p-8">
          <div className="absolute w-96 h-96 bg-white rounded-full opacity-10 blur-3xl pointer-events-none"></div>
          
          <img 
              src="/image/Pages/career.jpg" 
              alt="Join our team" 
              className="relative z-10 object-contain max-w-full max-h-[90vh] shadow-2xl rounded-xl"
          />
          
          <div className="absolute bottom-8 left-0 right-0 text-center text-white z-20 p-4">
              <h2 className="text-4xl font-bold mb-1 drop-shadow-lg">We are Hiring</h2>
              <p className="text-lg opacity-90 drop-shadow-md font-light">Be part of the BRWD. family.</p>
          </div>
      </div>

      <div className="w-full md:w-1/2 lg:w-7/12 bg-gradient-to-br from-amber-50 to-orange-100 h-screen overflow-y-auto">
          <nav className="bg-white/80 backdrop-blur-md shadow-sm px-8 py-4 sticky top-0 z-50">
            <div className="px-4 md:px-8 py-8 md:py-12 max-w-2xl mx-auto">
              <h1 className="text-2xl font-bold text-amber-600">BRWD. Careers</h1>
              <button onClick={() => setCurrentPage('home')} className="text-amber-600 hover:text-amber-700 font-medium">
                ← Back to Home
              </button>
            </div>
          </nav>
          
          <div className="px-8 py-12 max-w-2xl mx-auto">
              <div className="mb-12 text-center md:text-left">
                  <h2 className="text-4xl font-bold text-amber-800 mb-4">Join Our Team!</h2>
                  <p className="text-gray-600">We are looking for passionate individuals to craft the best coffee and tea experiences.</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-amber-500">
                  <h3 className="text-2xl font-bold text-amber-600 mb-6">Available Positions</h3>
                  <div className="space-y-6">
                      {availableCareers.map(pos => (
                          <div key={pos} className="border-b pb-4 last:border-0 last:pb-0">
                              <h4 className="font-semibold text-lg text-gray-800">{pos}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                  {pos === 'Barista' && 'Prepare and serve hot and cold beverages, maintain inventory, and ensure a clean environment.'}
                                  {pos === 'Shift Leader' && 'Oversee daily operations, manage staff shifts, and handle customer issues. Requires 1+ year experience.'}
                                  {pos === 'Kitchen Staff' && 'Assist in food preparation, maintain kitchen hygiene, and manage stock rotation.'}
                                  {pos === 'Marketing Associate' && 'Develop and execute social media strategies and local marketing campaigns.'}
                              </p>
                          </div>
                      ))}
                  </div>
              </div>

              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
                  <h3 className="text-2xl font-bold text-amber-600 mb-2">Apply Now</h3>
                  <p className="text-sm text-gray-500 mb-6">Fill out the form below to submit your application.</p>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-gray-50"/>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-gray-50"/>
                      </div>
                      <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-gray-50"/>
                      </div>
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Applying For</label>
                  <select value={position} onChange={(e) => setPosition(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white">
                      {availableCareers.map(pos => (
                          <option key={pos} value={pos}>{pos}</option>
                      ))}
                  </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Resume (PDF only, max 2MB)</label>
                    <input type="file" accept=".pdf" onChange={(e) => setResume(e.target.files[0])} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-600 hover:file:bg-amber-100"/>
                  </div>

                  <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-amber-500 text-white text-xl rounded-lg hover:bg-amber-600 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md mt-4"
                  >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-8">
                  By submitting this form, you agree to our privacy policy regarding your personal data.
              </p>
          </div>
      </div>
    </div>
  );
};

export default CareersPage;