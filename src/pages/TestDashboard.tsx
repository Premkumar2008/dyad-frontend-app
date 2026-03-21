import React from 'react';

const TestDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">Test Dashboard Working!</h1>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to the Dashboard</h2>
          <p className="text-gray-600 mb-6">This is a test to verify the routing is working correctly.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Feature 1</h3>
              <p className="text-blue-700">Dashboard functionality is working</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Feature 2</h3>
              <p className="text-green-700">Mobile responsive design</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Feature 3</h3>
              <p className="text-purple-700">Modern UI components</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;
