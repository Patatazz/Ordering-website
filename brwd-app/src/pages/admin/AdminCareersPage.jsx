import React from 'react';
import { ref, update, set } from 'firebase/database';

const AdminCareersPage = ({ applications, isAdmin, database, setCurrentPage, handleLogout }) => {

    const groupedApplications = applications.reduce((acc, app) => {
      if (!acc[app.position]) {
        acc[app.position] = [];
      }
      acc[app.position].push(app);
      return acc;
    }, {});
    
    const sortedPositions = Object.keys(groupedApplications).sort((a, b) => {
      return groupedApplications[b].length - groupedApplications[a].length;
    });

    const getStatusColor = (status) => {
      switch (status) {
        case 'new': return 'bg-yellow-500 text-gray-800';
        case 'reviewed': return 'bg-blue-500 text-white';
        case 'contacted': return 'bg-green-500 text-white';
        default: return 'bg-gray-300';
      }
    };

    const markReviewed = async (appId) => {
        const appRef = ref(database, `applications/${appId}`);
        await update(appRef, { status: 'reviewed' });
    };

    const markContacted = async (appId) => {
        const appRef = ref(database, `applications/${appId}`);
        await update(appRef, { status: 'contacted' });
    };

    const deleteApplication = async (appId) => {
        const appRef = ref(database, `applications/${appId}`);
        await set(appRef, null);
    };

    if (!isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-100">
          <p className="text-2xl text-red-600">Access Denied: Admin privileges required.</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <nav className="bg-white shadow-md px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-3xl font-bold text-red-600">BRWD. Applications</h1>
            <div className="flex gap-4">
              <button onClick={() => setCurrentPage('admin_menu')} className="text-red-600 hover:text-red-700 font-bold">Menu Editor</button>
              <button onClick={() => setCurrentPage('admin_orders')} className="text-red-600 hover:text-red-700 font-bold">Orders Dashboard</button>
              <button onClick={handleLogout} className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50">Logout</button>
            </div>
          </div>
        </nav>
        
        <main className="max-w-7xl mx-auto px-8 py-12">
          <h2 className="text-4xl font-bold text-red-700 mb-8">Job Applications ({applications.length} Total)</h2>
          
          {applications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-xl text-gray-600">No applications received yet.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {sortedPositions.map(position => (
                <div key={position}>
                  <h3 className="text-3xl font-bold text-amber-700 mb-6 border-b pb-2">
                    {position} ({groupedApplications[position].length} Applicants)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedApplications[position]
                       .sort((a, b) => b.timestamp - a.timestamp)
                       .map(app => (
                        <div key={app.id} className="bg-white rounded-xl shadow-lg p-6 space-y-3">
                          <div className="flex justify-between items-start">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(app.status)}`}>
                              {app.status.toUpperCase()}
                            </span>
                            <p className="text-xs text-gray-500">{new Date(app.timestamp).toLocaleDateString()}</p>
                          </div>

                          <p className="text-lg font-bold text-gray-900">{app.name}</p>
                          <p className="text-sm text-gray-600">Email: {app.email}</p>
                          <p className="text-sm text-gray-600">Phone: {app.phone}</p>

                          <div className="pt-3 border-t">
                            {app.resume ? (
                                <a 
                                  href={app.resume.data}
                                  download={app.resume.fileName}
                                  className="text-blue-600 hover:text-blue-900 underline font-medium block mb-3"
                                >
                                  View Resume (PDF)
                                </a>
                            ) : (
                                <span className="text-gray-400 italic block mb-3">No resume uploaded</span>
                            )}

                            <div className="flex gap-2">
                                <button onClick={() => markReviewed(app.id)} disabled={app.status === 'reviewed' || app.status === 'contacted'} className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:bg-gray-300">Mark Reviewed</button>
                                <button onClick={() => markContacted(app.id)} disabled={app.status === 'contacted'} className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:bg-gray-300">Contacted</button>
                                <button onClick={() => deleteApplication(app.id)} className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition">Reject</button>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
};

export default AdminCareersPage;