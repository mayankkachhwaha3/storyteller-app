import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StoryCard from "../components/StoryCard";
import { Story } from "../types";

interface StoryWithDefaults extends Omit<Story, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [stories, setStories] = useState<StoryWithDefaults[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGenerateStory = () => {
    navigate('/generate');
  };
  
  // Group stories by genre
  const storiesByGenre = stories.reduce<Record<string, StoryWithDefaults[]>>((acc, story) => {
    const genre = story.genre || 'Uncategorized';
    if (!acc[genre]) {
      acc[genre] = [];
    }
    acc[genre].push({
      ...story,
      createdAt: story.createdAt || new Date().toISOString(),
      updatedAt: story.updatedAt || new Date().toISOString()
    });
    return acc;
  }, {});

  // Fetch user-generated stories
  useEffect(() => {
    const fetchStories = async () => {
      try {
        console.log('Starting to load user stories...');
        setLoading(true);
        
        // Try to fetch from API first
        try {
          console.log('Fetching from API...');
          const response = await fetch('http://localhost:3001/api/stories', {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include',
            cache: 'no-store'
          });
          
          console.log('API response status:', response.status);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Fetched user stories:', data);
          
          if (!Array.isArray(data)) {
            throw new Error('Invalid data format received from server');
          }
          
          // Format stories with proper audio URLs
          const formattedStories = data.map(story => ({
            ...story,
            cover: story.cover?.startsWith('http') ? story.cover : 
                  `http://localhost:3001${story.cover?.startsWith('/') ? '' : '/'}${story.cover || '/covers/default.jpg'}`,
            audio: story.audio?.startsWith('http') ? story.audio : 
                  `http://localhost:3001${story.audio?.startsWith('/') ? '' : '/'}${story.audio || ''}`,
            createdAt: story.createdAt || new Date().toISOString(),
            updatedAt: story.updatedAt || new Date().toISOString()
          }));
          
          setStories(formattedStories);
          setError(null);
          
          // Save to local storage for offline access
          try {
            localStorage.setItem('stories', JSON.stringify(formattedStories));
            console.log('User stories saved to local storage');
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
            setError('No stories available. Please check your connection and try again.');
          }
        }
      } catch (err) {
        console.error('Error loading stories:', err);
        setError('Failed to load stories. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Story Library</h1>
            <button
              onClick={handleGenerateStory}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Create New Story
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Stories</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Story Library</h1>
            <button
              onClick={handleGenerateStory}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Create New Story
            </button>
          </div>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no stories
  if (Object.keys(storiesByGenre).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Story Library</h1>
            <button
              onClick={handleGenerateStory}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Create New Story
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Stories Yet</h2>
            <p className="text-gray-600 mb-6">Get started by creating your first story!</p>
            <button
              onClick={handleGenerateStory}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Your First Story
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Story Library</h1>
          <button
            onClick={handleGenerateStory}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Create New Story
          </button>
        </div>

        {Object.entries(storiesByGenre).map(([genre, genreStories]) => (
          <div key={genre} className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{genre}</h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {genreStories.map((story) => (
                <div key={story.id} className="h-full">
                  <StoryCard 
                    story={story}
                    onClick={() => navigate(`/player/${story.id}`, { state: { story } })}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {stories.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-400">No stories found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new story.</p>
            <div className="mt-6">
              <button
                onClick={handleGenerateStory}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Story
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
