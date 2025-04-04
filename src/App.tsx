import React, { useEffect, useState } from 'react';
import { Bell, ExternalLink, Trash2 } from 'lucide-react';
import { FacebookPost } from './types';

function App() {
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load posts from storage
    const loadPosts = () => {
      setIsLoading(true);
      chrome.storage.local.get(['posts'], (result) => {
        if (result.posts) {
          setPosts(result.posts);
        }
        setIsLoading(false);
      });
    };

    loadPosts();

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.posts) {
        setPosts(changes.posts.newValue || []);
      }
    });
  }, []);

  const clearAllPosts = () => {
    if (window.confirm('Are you sure you want to clear all tracked posts?')) {
      chrome.storage.local.remove(['posts'], () => {
        setPosts([]);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-[400px] h-[300px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-indigo-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-[400px] p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-indigo-600" />
          <h1 className="text-xl font-semibold text-gray-800">PostList</h1>
        </div>
        {posts.length > 0 && (
          <button
            onClick={clearAllPosts}
            className="flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:text-red-700 transition-colors"
            title="Clear all posts"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="mt-4 p-3 bg-white rounded-lg shadow-sm border border-indigo-100">
        <p className="text-sm text-gray-700">
          Posts tracked: <span className="font-medium">{posts.length}</span>
        </p>
      </div>
      
      {posts.length === 0 ? (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-indigo-100 text-center text-gray-600">
          No posts tracked yet. Start browsing Facebook to collect posts.
        </div>
      ) : (
        <div className="mt-4 space-y-4 max-h-[500px] overflow-y-auto">
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-800">
                  {post.author}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(post.timestamp).toLocaleString()}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">
                {post.content}
              </p>

              {post.imageUrl && (
                <div className="mb-3 rounded-lg overflow-hidden">
                  <img 
                    src={post.imageUrl} 
                    alt="Post content" 
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {post.postUrl && (
                <div className="text-right">
                  <a
                    href={post.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Post</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;