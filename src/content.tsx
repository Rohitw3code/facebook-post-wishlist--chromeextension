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
        const authorElement = postElement.querySelector('a[role="link"][tabindex="0"]');
        const contentElement = postElement.querySelector('div[dir="auto"][style*="text-align"]');
        const timestampElement = postElement.querySelector('a[role="link"][tabindex="0"][href*="?__cft__"]');
        const imageElement = postElement.querySelector('img[src*="scontent"]');
        const likesElement = postElement.querySelector('span[role="toolbar"]');
        const commentsElement = postElement.querySelector('span[role="presentation"]:has(span)');
        const sharesElement = postElement.querySelector('div[role="button"]:has(span)');
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

    // Function to inject save button into post
    const injectSaveButton = (postElement: Element) => {
      // Check if button already exists
      if (postElement.querySelector('.postlist-save-btn')) return;

      const postData = extractPostData(postElement);
      if (!postData) return;

      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'postlist-save-btn-container';

      const saveButton = document.createElement('button');
      saveButton.className = 'postlist-save-btn';
      saveButton.innerHTML = `
        <span class="postlist-save-icon">📥</span>
        <span class="postlist-save-text">Save to PostList</span>
      `;

      saveButton.addEventListener('click', () => {
        setPosts(prevPosts => {
          // Check if post already exists
          const isDuplicate = prevPosts.some(p => 
            p.content === postData.content && 
            p.author === postData.author
          );

          if (isDuplicate) {
            alert('This post has already been saved!');
            return prevPosts;
          }

          const updatedPosts = [...prevPosts, postData];
          // Keep only the last 100 posts
          if (updatedPosts.length > 100) {
            updatedPosts.shift();
          }

          // Save to storage
          chrome.storage.local.set({ posts: updatedPosts });

          // Update button state
          saveButton.classList.add('saved');
          saveButton.innerHTML = `
            <span class="postlist-save-icon">✓</span>
            <span class="postlist-save-text">Saved</span>
          `;
          setTimeout(() => {
            saveButton.disabled = true;
          }, 1000);

          return updatedPosts;
        });
      });

      buttonContainer.appendChild(saveButton);

      // Find a good spot to inject the button (after the post content)
      const targetElement = postElement.querySelector('[role="article"] > div');
      if (targetElement) {
        targetElement.appendChild(buttonContainer);
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
              postElements.forEach(injectSaveButton);
            }
          });
        });
      });

      // Start observing the entire document for changes
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Also process any existing posts
      document.querySelectorAll('[role="article"]').forEach(injectSaveButton);

      return observer;
    };

    const observer = observePosts();
    return () => observer.disconnect();
  }, []);

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
          Posts saved: {posts.length}
        </p>
      </div>
    </div>
  );
}

// Create container for the alert
const container = document.createElement('div');
document.body.appendChild(container);

// Add styles for the save button
const styles = document.createElement('style');
styles.textContent = `
  .postlist-save-btn-container {
    margin: 8px 16px;
    display: flex;
    justify-content: flex-end;
  }

  .postlist-save-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 6px;
    background-color: #4f46e5;
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .postlist-save-btn:hover {
    background-color: #4338ca;
  }

  .postlist-save-btn.saved {
    background-color: #22c55e;
    cursor: default;
  }

  .postlist-save-btn:disabled {
    opacity: 0.7;
    cursor: default;
  }

  .postlist-save-icon {
    font-size: 16px;
  }
`;
document.head.appendChild(styles);

// Render the alert
const root = createRoot(container);
root.render(<AlertBox />);