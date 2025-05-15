import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StoryCard from "../components/StoryCard";
import { Story } from "../types";
import { loadStories } from "../utils/storyLoader";

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStories = async () => {
      try {
        console.log('Starting to load stories...');
        setLoading(true);
        
        // Try to fetch from API first
        try {
          console.log('Fetching from API...');
          const response = await fetch('http://localhost:3001/api/stories', {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include'
          });
          console.log('API response status:', response.status);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Fetched stories:', data);
          
          if (!Array.isArray(data)) {
            throw new Error('Invalid data format received from server');
          }
          
          setStories(data);
          setError(null);
          
          // Save to local storage for offline access
          try {
            localStorage.setItem('stories', JSON.stringify(data));
            console.log('Stories saved to local storage');
          } catch (storageError) {
            console.warn('Could not save to local storage:', storageError);
          }
          
        } catch (apiError) {
          console.warn('Falling back to local storage due to API error:', apiError);
          
          // Fall back to local storage if API fails
          try {
            const savedStories = localStorage.getItem('stories');
            if (savedStories) {
              const parsedStories = JSON.parse(savedStories);
              if (Array.isArray(parsedStories) && parsedStories.length > 0) {
                setStories(parsedStories);
                setError('Could not connect to server. Showing cached stories.');
                return;
              }
            }
            throw new Error('No valid stories available offline');
          } catch (localError) {
            console.error('Error loading from local storage:', localError);
            throw localError;
          }
        }
      } catch (err) {
        console.error('Error loading stories:', err);
        setError('Failed to load stories. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const searchTerm = (form.elements.namedItem('search') as HTMLInputElement)?.value;
    if (searchTerm) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading stories...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <main className="flex-grow p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8">Discover Stories</h1>
        
        <form onSubmit={handleSearch} className="mb-6">
          <input 
            type="text"
            name="search"
            placeholder="Search stories..."
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </form>
        
        {stories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400">No stories found.</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">Add stories to the public/stories directory to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stories.map((story) => (
              <StoryCard 
                key={story.id} 
                story={story} 
                onClick={() => navigate(`/player/${story.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
