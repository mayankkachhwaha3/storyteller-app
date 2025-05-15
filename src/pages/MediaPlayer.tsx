import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from 'react';
import { Story } from '../types';

export default function MediaPlayer() {
  const { id } = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStory = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        // Try to fetch from API first
        try {
          const response = await fetch(`http://localhost:3001/api/stories/${id}`);
          if (response.ok) {
            const data = await response.json();
            setStory(data);
            return;
          }
          throw new Error('Story not found');
        } catch (apiError) {
          console.warn('Falling back to local storage due to API error:', apiError);
          
          // Fall back to local storage if API fails
          const savedStories = localStorage.getItem('stories');
          if (savedStories) {
            const stories = JSON.parse(savedStories);
            const foundStory = stories.find((s: Story) => s.id === id);
            if (foundStory) {
              setStory(foundStory);
              return;
            }
          }
          throw new Error('Story not found in local storage');
        }
      } catch (error) {
        console.error('Error loading story:', error);
        navigate('/');
      }
    };

    fetchStory();
  }, [id, navigate]);

  useEffect(() => {
    // Set up audio event listeners
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('loadedmetadata', updateDuration);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [story]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!story) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="p-4">
        <button 
          onClick={() => navigate(-1)}
          className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-64 h-64 rounded-2xl overflow-hidden mb-8 shadow-xl">
          <img 
            src={story.cover} 
            alt={story.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">{story.title}</h1>
        <p className="text-gray-400 mb-2">{story.author}</p>
        <p className="text-sm text-gray-500 mb-8">{story.genre} • {formatTime(duration)}</p>
        
        {story.description && (
          <div className="max-w-md mb-8 px-4">
            <p className="text-gray-300 text-sm">{story.description}</p>
          </div>
        )}
        
        <div className="w-full max-w-md mb-8">
          <div 
            ref={progressBarRef}
            className="h-1.5 bg-gray-700 rounded-full cursor-pointer relative group"
            onClick={handleProgressBarClick}
          >
            <div 
              className="h-full bg-green-500 rounded-full absolute top-0 left-0"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 -top-1 h-3 w-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(duration - currentTime)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Previous track"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>
          
          <button 
            className="bg-green-600 hover:bg-green-500 text-white rounded-full p-4 transition-colors"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
          
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Next track"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>
        </div>
      </div>
      
      <audio 
        ref={audioRef}
        src={story.audio}
        preload="metadata"
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />
    </div>
  );
}
