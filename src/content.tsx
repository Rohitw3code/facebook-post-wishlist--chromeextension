import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { FacebookPost } from './types';

function AlertBox() {
  const [isVisible, setIsVisible] = React.useState(true);
  const [posts, setPosts] = React.useState<FacebookPost[]>([]);

  useEffect(() => {
    // Load existing posts from storage when component mounts
    chrome.storage.local.get(['posts'], (result) => {
      if (result.posts) {
        setPosts(result.posts);
      }
    });

    // Function to extract post data
    const extractPostData = (postElement: Element): FacebookPost | null => {
      try {
        // Find the author element - looking for the profile link
        const authorElement = postElement.querySelector('a[role="link"][tabindex="0"]');
        
        // Find the content element - looking for post text content
        const contentElement = postElement.querySelector('div[dir="auto"][style*="text-align"]');
        
        // Find the timestamp element
        const timestampElement = postElement.querySelector('a[role="link"][tabindex="0"][href*="?__cft__"]');

        // Find image elements
        const imageElement = postElement.querySelector('img[src*="scontent"]');

        // Find engagement stats
        const likesElement = postElement.querySelector('span[role="toolbar"]');
        const commentsElement = postElement.querySelector('span[role="presentation"]:has(span)');
        const sharesElement = postElement.querySelector('div[role="button"]:has(span)');

        // Find post URL
        const postUrlElement = postElement.querySelector('a[href*="/posts/"]');

        if (!authorElement || !contentElement) return null;

        const post: FacebookPost = {
          id: Math.random().toString(36).substring(7),
          content: contentElement.textContent?.trim() || '',
          timestamp: new Date().toISOString(),
          author: authorElement.textContent?.trim() || '',
          profileLink: authorElement.getAttribute('href') || '',
          imageUrl: imageElement?.getAttribute('src'),
          likes: parseInt(likesElement?.textContent?.match(/\d+/)?.[0] || '0'),
          comments: parseInt(commentsElement?.textContent?.match(/\d+/)?.[0] || '0'),
          shares: parseInt(sharesElement?.textContent?.match(/\d+/)?.[0] || '0'),
          postUrl: postUrlElement?.getAttribute('href') || ''
        };

        return post;
      } catch (error) {
        console.error('Error extracting post data:', error);
        return null;
      }
    };

    // Function to observe DOM changes for new posts
    const observePosts = () => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // Look for post containers
              const postElements = node.querySelectorAll('[role="article"]');
              
              postElements.forEach((postElement) => {
                const postData = extractPostData(postElement);
                if (postData) {
                  setPosts((prevPosts) => {
                    // Check if post already exists based on content and author
                    const isDuplicate = prevPosts.some(p => 
                      p.content === postData.content && 
                      p.author === postData.author
                    );

                    if (isDuplicate) {
                      return prevPosts;
                    }

                    // Keep only the last 100 posts to prevent storage issues
                    const updatedPosts = [...prevPosts, postData];
                    if (updatedPosts.length > 100) {
                      updatedPosts.shift(); // Remove oldest post
                    }
                    return updatedPosts;
                  });
                }
              });
            }
          });
        });
      });

      // Start observing the entire document for changes
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      return observer;
    };

    const observer = observePosts();
    return () => observer.disconnect();
  }, []);

  // Save posts to extension storage whenever posts change
  useEffect(() => {
    if (posts.length > 0) {
      chrome.storage.local.set({ posts }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error saving posts:', chrome.runtime.lastError);
        } else {
          console.log('Posts saved successfully:', posts.length);
        }
      });
    }
  }, [posts]);

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
        <p className="text-gray-600 text-sm mt-2">
          Posts tracked: {posts.length}
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