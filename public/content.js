// Create alert box container
const container = document.createElement('div');
container.className = 'fixed top-4 right-4 z-50 animate-fade-in';

// Create alert box content
const alertBox = document.createElement('div');
alertBox.className = 'bg-white rounded-lg shadow-lg p-4 border border-indigo-100 w-80';
alertBox.innerHTML = `
  <div class="flex justify-between items-center mb-2">
    <h2 class="text-lg font-semibold text-gray-800">PostList Alert</h2>
    <button class="text-gray-400 hover:text-gray-600 transition-colors">×</button>
  </div>
  <p class="text-gray-600 text-sm">
    You are currently browsing Facebook. Stay mindful of your time!
  </p>
`;

// Add styles
const styles = document.createElement('style');
styles.textContent = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
  }
`;

// Add close button functionality
const closeButton = alertBox.querySelector('button');
closeButton.addEventListener('click', () => {
  container.remove();
});

// Append elements to the page
document.head.appendChild(styles);
container.appendChild(alertBox);
document.body.appendChild(container);