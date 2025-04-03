import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

function AlertBox() {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-lg p-4 border border-indigo-100 w-80">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-800">PostList Alert</h2>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>
        <p className="text-gray-600 text-sm">
          You are currently browsing Facebook. Stay mindful of your time!
        </p>
      </div>
    </div>
  );
}

// Create container for the alert
const container = document.createElement('div');
document.body.appendChild(container);

// Render the alert
const root = createRoot(container);
root.render(<AlertBox />);