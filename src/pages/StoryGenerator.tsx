import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Story } from "../types";

interface Suggestion {
  id: number;
  theme: string;
}

export default function StoryGenerator() {
  const [theme, setTheme] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTheme(value);
    setSelectedSuggestion(null);
    
    // Generate suggestions based on input
    if (value.length > 2) {
      const newSuggestions = generateSuggestions(value);
      setSuggestions(newSuggestions);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setTheme(suggestion.theme);
    setSelectedSuggestion(suggestion);
    setSuggestions([]);
  };

  const generateSuggestions = (input: string): Suggestion[] => {
    // Generate suggestions based on common story themes
    const baseThemes = [
      "magical forest",
      "space adventure",
      "underwater journey",
      "fairy tale",
      "fantasy quest",
      "mystery",
      "adventure",
      "animal friends",
      "dream world",
      "magical creatures"
    ];

    return baseThemes
      .filter(theme => theme.toLowerCase().includes(input.toLowerCase()))
      .slice(0, 5)
      .map((theme, index) => ({ id: index, theme }));
  };

  const handleGenerate = async () => {
    if (!theme.trim()) {
      setError("Please enter a story theme");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ theme })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to generate story');
      }

      const story = await response.json();
      console.log('Generated story:', story);
      
      // Ensure the story has all required fields
      const storyWithDefaults = {
        ...story,
        id: story.id || Date.now().toString(),
        title: story.title || 'Untitled Story',
        text: story.text || '',
        audio: story.audio || '',
        cover: story.cover || '/covers/default.jpg',
        duration: story.duration || '0:00',
        author: story.author || 'Unknown Author',
        description: story.description || 'No description available',
        genre: story.genre || 'Uncategorized',
      };
      
      console.log('Navigating with story data:', storyWithDefaults);
      
      // Navigate to the player with the story data in the location state
      navigate(`/player/${storyWithDefaults.id}`, { 
        state: { 
          story: storyWithDefaults 
        } 
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate story. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">Generate a New Story</h1>
        
        <div className="bg-zinc-800 rounded-lg p-6">
          <div className="mb-4">
            <input
              type="text"
              value={theme}
              onChange={handleThemeChange}
              placeholder="Enter a story theme..."
              className="w-full px-4 py-2 rounded-lg bg-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {suggestions.length > 0 && (
              <div className="mt-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="block w-full px-4 py-2 text-left text-zinc-400 hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    {suggestion.theme}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-600 text-red-100 px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? "Generating..." : "Generate Story"}
          </button>
        </div>
      </div>
    </div>
  );
}
