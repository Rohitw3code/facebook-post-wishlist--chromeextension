import React from 'react';
import { Bell } from 'lucide-react';

function App() {
  return (
    <div className="w-80 p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex items-center gap-3 mb-4">
        <Bell className="w-6 h-6 text-indigo-600" />
        <h1 className="text-xl font-semibold text-gray-800">PostList</h1>
      </div>
      <p className="text-gray-600 text-sm">
        This extension will alert you when you visit Facebook.
      </p>
      <div className="mt-4 p-3 bg-white rounded-lg shadow-sm border border-indigo-100">
        <p className="text-sm text-gray-700">
          Status: <span className="text-green-600 font-medium">Active</span>
        </p>
      </div>
    </div>
  );
}

export default App;