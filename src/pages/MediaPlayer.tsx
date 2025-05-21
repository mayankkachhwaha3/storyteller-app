import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from 'react';
import { Story } from '../types';

interface LocationState {
  story?: Story;
}

// Default lullaby audio path
const DEFAULT_LULLABY_PATH = '/assets/audio/lullabies/default-lullaby.mp3';
// Icons
const PlayIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const VolumeUpIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
  </svg>
);

const VolumeMuteIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const StepBackwardIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.968A1 1 0 0017 14.932V5.068a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
  </svg>
);

const StepForwardIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.445 14.832A1 1 0 009 14v-2.798L3.555 16.1A1 1 0 002 15.268V4.732a1 1 0 001.555-.832L9 8.798V6a1 1 0 011.555-.832l6 4a1 1 0 010 1.664l-6 4z" />
  </svg>
);

// Helper function to get absolute URL
const getAbsoluteUrl = (url: string) => {
  if (!url) return '';
  
  // If URL is already absolute, return as is
  if (url.startsWith('http')) return url;
  
  // Check if we're running in development or production
  const isDev = process.env.NODE_ENV === 'development';
  const baseUrl = isDev 
    ? 'http://localhost:3001'  // Development
    : window.location.origin;  // Production - use the same protocol as the page
  
  // Ensure there's exactly one slash between base URL and path
  const separator = url.startsWith('/') ? '' : '/';
  return `${baseUrl}${separator}${url}`;
};



export default function MediaPlayer() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [story, setStory] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [lullabyEnabled, setLullabyEnabled] = useState(true);
  const [lullabyVolume, setLullabyVolume] = useState(0.3); // 30% volume for lullaby
  const [showStoryText, setShowStoryText] = useState(false); // State to toggle story text visibility
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const lullabyRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeSliderRef = useRef<HTMLDivElement>(null);
  const lullabyVolumeRef = useRef<HTMLDivElement>(null);

  // Check for story in location state first, then fetch from API if needed
  useEffect(() => {
    let isMounted = true;
    
    const initializeStory = async () => {
      if (!id) {
        console.error('No story ID provided');
        setError('No story ID provided');
        setIsLoading(false);
        navigate('/');
        return;
      }

      console.log(`Initializing story with ID: ${id}`);
      setIsLoading(true);
      setError(null);
      
      try {
        // First check if we have the story data in location state
        const locationState = location.state as LocationState;
        if (locationState?.story) {
          console.log('Using story from location state');
          
          // Ensure we have the full story text (it might be in a 'fullText' field)
          const storyData = locationState.story;
          const storyText = storyData.text || storyData.fullText || '';
          
          const storyWithDefaults = {
            ...storyData,
            id: storyData.id || id,
            title: storyData.title || 'Untitled Story',
            author: storyData.author || 'Unknown Author',
            description: storyData.description || 'No description available',
            cover: storyData.cover || '/covers/default.jpg',
            genre: storyData.genre || 'Uncategorized',
            duration: storyData.duration || '0:00',
            text: storyText,  // Use the full text from either field
            audio: storyData.audio || '',
            createdAt: storyData.createdAt || new Date().toISOString(),
            updatedAt: storyData.updatedAt || new Date().toISOString(),
          };
          
          console.log('Story data from location state:', storyWithDefaults);
          
          if (isMounted) {
            setStory(storyWithDefaults);
            
            // Ensure audio URL is properly formatted
            let audioPath = storyWithDefaults.audio;
            if (audioPath && !audioPath.startsWith('http') && !audioPath.startsWith('/')) {
              audioPath = `/${audioPath}`;
            }
            const audioUrl = getAbsoluteUrl(audioPath);
            console.log('Setting audio URL from location state:', audioUrl);
            
            // Verify the audio URL is accessible
            try {
              const response = await fetch(audioUrl, { 
                method: 'HEAD',
                mode: 'cors',
                credentials: 'same-origin'
              });
              if (!response.ok) {
                console.warn(`Audio file not found at: ${audioUrl}`);
                // Don't fail here, let the audio element handle the error
              }
            } catch (err) {
              console.warn('Error checking audio URL:', err);
            }
            
            setAudioUrl(audioUrl);
            setIsLoading(false);
          }
          return;
        }

        // If not in location state, fetch from API
        console.log('Fetching story from API');
        const response = await fetch(`http://localhost:3001/api/stories/${id}`, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          cache: 'no-store' as RequestCache
        });
        
        console.log('API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched story data:', data);
          
          if (!data.audio) {
            throw new Error('No audio URL in story data');
          }
          
          const audioUrl = getAbsoluteUrl(data.audio);
          console.log('Audio URL:', audioUrl);
          
          if (isMounted) {
            setStory(data);
            setAudioUrl(audioUrl);
          }
          
          return;
        }
        
        throw new Error(`API returned status: ${response.status}`);
        
      } catch (error) {
        console.error('Error loading story:', error);
        
        // Fall back to local storage if API fails
        try {
          const savedStories = localStorage.getItem('stories');
          if (savedStories) {
            const stories = JSON.parse(savedStories);
            const foundStory = stories.find((s: Story) => s.id === id);
            
            if (foundStory) {
              console.log('Found story in local storage:', foundStory);
              
              if (!foundStory.audio) {
                throw new Error('No audio URL in local story data');
              }
              
              const audioUrl = getAbsoluteUrl(foundStory.audio);
              
              if (isMounted) {
                setStory(foundStory);
                setAudioUrl(audioUrl);
              }
              return;
            }
          }
          
          throw new Error('Story not found in local storage');
          
        } catch (localError) {
          console.error('Error with local storage fallback:', localError);
          if (isMounted) {
            setError(`Failed to load story: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeStory();

    return () => {
      isMounted = false;
    };
  }, [id, navigate, location.state]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const audio = audioRef.current;
    if (!audio) return;

    switch (e.key.toLowerCase()) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlayPause();
        break;
      case 'm':
        e.preventDefault();
        toggleMute();
        break;
      case 'arrowleft':
        e.preventDefault();
        seek(-15);
        break;
      case 'arrowright':
        e.preventDefault();
        seek(15);
        break;
      case 'arrowup':
        e.preventDefault();
        setVolume(prev => Math.min(prev + 0.1, 1));
        break;
      case 'arrowdown':
        e.preventDefault();
        setVolume(prev => Math.max(prev - 0.1, 0));
        break;
    }
  }, []);

  useEffect(() => {
    // Set up keyboard event listener
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Update volumes when they change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    if (lullabyRef.current) {
      lullabyRef.current.volume = isMuted ? 0 : lullabyVolume * volume; // Scale lullaby volume with main volume
    }
  }, [volume, lullabyVolume, isMuted]);
  
  // Toggle lullaby on/off
  const toggleLullaby = useCallback(() => {
    const newState = !lullabyEnabled;
    setLullabyEnabled(newState);
    
    if (lullabyRef.current) {
      if (newState && isPlaying) {
        // If enabling and main audio is playing, play the lullaby
        lullabyRef.current.play().catch(e => {
          console.warn('Could not play lullaby:', e);
        });
      } else if (!newState) {
        // If disabling, pause the lullaby
        lullabyRef.current.pause();
        lullabyRef.current.currentTime = 0;
      }
    }
  }, [lullabyEnabled, isPlaying]);

  // Initialize audio with saved volumes
  useEffect(() => {
    // Load main volume
    const savedVolume = localStorage.getItem('audioVolume');
    if (savedVolume) {
      const vol = parseFloat(savedVolume);
      setVolume(vol);
    }
    
    // Load lullaby settings
    const savedLullabyVolume = localStorage.getItem('lullabyVolume');
    if (savedLullabyVolume) {
      setLullabyVolume(parseFloat(savedLullabyVolume));
    }
    
    const savedLullabyEnabled = localStorage.getItem('lullabyEnabled');
    if (savedLullabyEnabled !== null) {
      setLullabyEnabled(savedLullabyEnabled === 'true');
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('audioVolume', volume.toString());
    localStorage.setItem('lullabyVolume', lullabyVolume.toString());
    localStorage.setItem('lullabyEnabled', lullabyEnabled.toString());
  }, [volume, lullabyVolume, lullabyEnabled]);

  useEffect(() => {
    // Set up audio event listeners
    const audio = audioRef.current;
    const lullaby = lullabyRef.current;
    if (!audio || !lullaby) return;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    // Sync lullaby with main audio
    const syncLullaby = () => {
      if (!lullaby.paused && audio.paused) {
        lullaby.pause();
      } else if (!audio.paused && lullaby.paused && lullabyEnabled) {
        lullaby.play().catch(e => console.warn('Lullaby play failed:', e));
      }
      
      // Keep lullaby in sync with main audio (for looping)
      if (Math.abs(lullaby.currentTime - (audio.currentTime % (lullaby.duration || 1))) > 0.5) {
        lullaby.currentTime = audio.currentTime % (lullaby.duration || 1);
      }
    };
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('loadedmetadata', updateDuration);
    
    // Sync lullaby state with main audio
    const syncInterval = setInterval(syncLullaby, 1000);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('loadedmetadata', updateDuration);
      clearInterval(syncInterval);
    };
  }, [story, lullabyEnabled]);

  // Handle audio play/pause
  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current) return;
    
    try {
      if (isPlaying) {
        // Pause both audio and lullaby
        audioRef.current.pause();
        if (lullabyRef.current) {
          lullabyRef.current.pause();
        }
        setIsPlaying(false);
      } else {
        // Play main audio first
        await audioRef.current.play();
        
        // If lullaby is enabled, play it as well
        if (lullabyEnabled && lullabyRef.current) {
          try {
            await lullabyRef.current.play();
          } catch (e) {
            console.warn('Could not play lullaby:', e);
            // Continue with main audio even if lullaby fails
          }
        }
        
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      setError('Failed to play audio. Please try again.');
      setIsPlaying(false);
    }
  }, [isPlaying, lullabyEnabled]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMuted) {
      audio.volume = volume || 0.7;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const seek = (seconds: number) => {
    const audio = audioRef.current;
    const lullaby = lullabyRef.current;
    if (!audio || !lullaby) return;
    
    const newTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
    
    // Sync both audio elements
    audio.currentTime = newTime;
    lullaby.currentTime = newTime % (lullaby.duration || 1); // Loop the lullaby if needed
    
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeSliderRef.current) return;
    
    const rect = volumeSliderRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(pos, 1));
    
    setVolume(newVolume);
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading story...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !story) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Story</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The story could not be loaded. Please try again later.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => navigate('/')}
            className="ml-3 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Go Home
          </button>
        </div>
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
        
        <div className="flex flex-col items-center w-full max-w-md space-y-6">
          <div className="flex items-center justify-center w-full space-x-6">
            <button 
              className="text-gray-400 hover:text-white transition-colors"
              onClick={() => seek(-15)}
              aria-label="Seek backward 15 seconds"
            >
              <StepBackwardIcon />
            </button>
            
            <button 
              className="bg-green-600 hover:bg-green-500 text-white rounded-full p-4 transition-colors"
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            
            <button 
              className="text-gray-400 hover:text-white transition-colors"
              onClick={() => seek(15)}
              aria-label="Seek forward 15 seconds"
            >
              <StepForwardIcon />
            </button>
          </div>

          {/* Volume Control */}
          <div className="w-full space-y-4">
            {/* Main Volume Control */}
            <div className="flex items-center space-x-3 px-4">
              <button 
                onClick={toggleMute}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeMuteIcon /> : <VolumeUpIcon />}
              </button>
              
              <div 
                ref={volumeSliderRef}
                className="flex-1 h-1 bg-gray-700 rounded-full cursor-pointer group relative"
                onClick={handleVolumeChange}
              >
                <div 
                  className="h-full bg-gray-400 rounded-full absolute top-0 left-0"
                  style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                >
                  <div className="absolute right-0 -top-1 h-3 w-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>

            {/* Lullaby Control */}
            <div className="flex items-center space-x-3 px-4">
              <button 
                onClick={toggleLullaby}
                className={`p-1 rounded-full ${lullabyEnabled ? 'text-green-500' : 'text-gray-500'}`}
                aria-label={lullabyEnabled ? 'Disable lullaby' : 'Enable lullaby'}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              
              <div 
                ref={lullabyVolumeRef}
                className="flex-1 h-1 bg-gray-700 rounded-full cursor-pointer group relative"
                onClick={(e) => {
                  if (!lullabyVolumeRef.current) return;
                  const rect = lullabyVolumeRef.current.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  setLullabyVolume(Math.max(0, Math.min(pos, 1)));
                }}
              >
                <div 
                  className="h-full bg-blue-400 rounded-full absolute top-0 left-0 transition-all duration-300"
                  style={{ 
                    width: `${lullabyEnabled ? lullabyVolume * 100 : 0}%`,
                    opacity: lullabyEnabled ? 1 : 0.5
                  }}
                >
                  <div className="absolute right-0 -top-1 h-3 w-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2 text-center">
          <p>Press <kbd className="px-2 py-1 bg-gray-800 rounded">←</kbd> <kbd className="px-2 py-1 bg-gray-800 rounded">→</kbd> to seek 15s, <kbd className="px-2 py-1 bg-gray-800 rounded">↑</kbd> <kbd className="px-2 py-1 bg-gray-800 rounded">↓</kbd> for volume, <kbd className="px-2 py-1 bg-gray-800 rounded">Space</kbd> to play/pause</p>
        </div>
      </div>
      
      {/* Story Text Section - Collapsible */}
      <div className="mt-6 max-w-4xl mx-auto px-4">
        <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl border border-zinc-700/50 overflow-hidden">
          <button 
            onClick={() => setShowStoryText(!showStoryText)}
            className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none"
            aria-expanded={showStoryText}
          >
            <h2 className="text-lg font-semibold text-white">
              {showStoryText ? 'Hide Story Text' : 'Show Story Text'}
            </h2>
            <svg 
              className={`w-5 h-5 text-gray-400 transform transition-transform ${showStoryText ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showStoryText && (
            <div className="px-6 pb-6 pt-2 border-t border-zinc-700/50">
              <div className="prose prose-invert max-w-none max-h-96 overflow-y-auto pr-2">
                {(() => {
                  // Debug log the story object
                  console.log('Story object in render:', story);
                  
                  // Try to get text from various possible fields
                  const storyText = story?.text || story?.fullText || '';
                  
                  if (storyText) {
                    // Split by double newlines to preserve paragraphs
                    return storyText.split('\n\n').map((paragraph: string, index: number) => {
                      // Split by single newlines within paragraphs
                      return (
                        <div key={index} className="mb-4">
                          {paragraph.split('\n').map((line, lineIndex) => (
                            <p key={`${index}-${lineIndex}`} className="text-zinc-300 mb-2 whitespace-pre-line">
                              {line.trim()}
                            </p>
                          ))}
                        </div>
                      );
                    });
                  }
                  
                  // If no text is available, show a message
                  return (
                    <div className="text-center py-4">
                      <p className="text-zinc-400 mb-2">No story text available.</p>
                      <p className="text-zinc-500 text-sm">
                        The story might not have been generated with text content.
                      </p>
                      {story && (
                        <div className="mt-4 p-3 bg-zinc-800/50 rounded text-left">
                          <p className="text-xs text-zinc-400 mb-2">Debug Info:</p>
                          <pre className="text-xs text-zinc-400 overflow-auto max-h-40">
                            {JSON.stringify({
                              hasText: !!story.text,
                              hasFullText: !!story.fullText,
                              textLength: story.text?.length || 0,
                              fullTextLength: story.fullText?.length || 0,
                              textPreview: story.text ? story.text.substring(0, 100) + '...' : null,
                              fullTextPreview: story.fullText ? story.fullText.substring(0, 100) + '...' : null,
                              storyKeys: Object.keys(story)
                            }, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Story Audio */}
      <audio 
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        crossOrigin="anonymous"
        onError={(e) => {
          console.error('Audio error:', e);
          console.error('Audio source URL:', audioUrl);
          console.error('Audio element error:', audioRef.current?.error);
          
          // Try to get more detailed error information
          const audioElement = audioRef.current;
          let errorMessage = 'Failed to load audio. The audio file may be corrupted or inaccessible.';
          
          if (audioElement) {
            switch(audioElement.error?.code) {
              case MediaError.MEDIA_ERR_ABORTED:
                errorMessage = 'Audio playback was aborted.';
                break;
              case MediaError.MEDIA_ERR_NETWORK:
                errorMessage = 'A network error occurred while fetching the audio.';
                break;
              case MediaError.MEDIA_ERR_DECODE:
                errorMessage = 'The audio playback was aborted due to a corruption problem or because the audio is not supported.';
                break;
              case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMessage = 'The audio format is not supported by your browser.';
                break;
              default:
                errorMessage = `Error loading audio (${audioElement.error?.code}).`;
            }
          }
          
          console.error('Audio error details:', errorMessage);
          setError(errorMessage);
        }}
        onLoadedMetadata={() => {
          console.log('Audio metadata loaded in audio element');
          if (audioRef.current) {
            console.log('Audio duration from element:', audioRef.current.duration);
            setDuration(audioRef.current.duration);
          }
        }}
        onCanPlay={() => {
          console.log('Audio can play');
          // Auto-play when ready if user has interacted with the page
          if (audioRef.current && isPlaying) {
            const playPromise = audioRef.current.play();
            
            // If lullaby is enabled, try to play it as well
            if (lullabyEnabled && lullabyRef.current) {
              lullabyRef.current.play().catch(e => {
                console.warn('Could not auto-play lullaby:', e);
              });
            }
            
            playPromise.catch(e => {
              console.error('Auto-play failed:', e);
              // Don't show error for autoplay failures, let user click play
            });
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onEnded={() => {
          console.log('Playback ended');
          setIsPlaying(false);
          setCurrentTime(0);
          // Also stop the lullaby when the story ends
          if (lullabyRef.current) {
            lullabyRef.current.pause();
            lullabyRef.current.currentTime = 0;
          }
        }}
        onPlay={() => {
          console.log('Playback started');
          setIsPlaying(true);
          // Start lullaby when main audio starts
          if (lullabyEnabled && lullabyRef.current) {
            lullabyRef.current.play().catch(e => {
              console.warn('Could not play lullaby:', e);
            });
          }
        }}
        onPause={() => {
          console.log('Playback paused');
          setIsPlaying(false);
          // Pause lullaby when main audio is paused
          if (lullabyRef.current) {
            lullabyRef.current.pause();
          }
        }}
      />
      
      {/* Background Lullaby Audio */}
      <audio
        ref={lullabyRef}
        src={DEFAULT_LULLABY_PATH}
        preload="auto"
        loop
        crossOrigin="anonymous"
        onError={(e) => {
          console.warn('Lullaby audio error:', e);
          console.error('Lullaby source URL:', DEFAULT_LULLABY_PATH);
          console.error('Lullaby element error:', lullabyRef.current?.error);
          // Don't show error to user, just disable lullaby
          setLullabyEnabled(false);
        }}
        onCanPlay={() => {
          console.log('Lullaby can play');
          // Auto-play if main audio is playing
          if (isPlaying && lullabyEnabled && audioRef.current && !audioRef.current.paused) {
            lullabyRef.current?.play().catch(e => {
              console.warn('Auto-play lullaby failed:', e);
            });
          }
        }}
      />
    </div>
  );
}
