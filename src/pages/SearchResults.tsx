import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import StoryCard from "../components/StoryCard";
import storiesData from "../data/stories.json";
import { Story } from "../types";

export default function SearchResults() {
  const { query = "" } = useParams<{ query: string }>();
  const [results, setResults] = useState<Story[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (query) {
      // Simple search logic - in a real app, this would be an API call
      const searchTerm = query.toLowerCase();
      const filtered = storiesData.filter(
        (story: Story) =>
          story.title.toLowerCase().includes(searchTerm) ||
          story.author.toLowerCase().includes(searchTerm) ||
          story.genre.toLowerCase().includes(searchTerm)
      ) as Story[];
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="flex-1 px-5 py-6 pb-24">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 text-2xl"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold">Search Results</h1>
      </div>

      <p className="text-zinc-400 mb-6">
        {results.length} results for "{query}"
      </p>

      {results.length > 0 ? (
        <div className="space-y-6">
          {results.map((story) => (
            <div
              key={story.id}
              className="bg-zinc-800 rounded-xl p-4 flex items-center"
              onClick={() => navigate(`/player/${story.id}`)}
            >
              <img
                src={story.cover}
                alt={story.title}
                className="w-16 h-16 object-cover rounded-lg mr-4"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{story.title}</h3>
                <p className="text-sm text-zinc-400">by {story.author}</p>
                <span className="text-xs text-accent">{story.genre}</span>
              </div>
              <span className="text-zinc-400 text-sm">{story.duration}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">No results found</h2>
          <p className="text-zinc-400">
            We couldn't find any stories matching "{query}"
          </p>
        </div>
      )}
    </div>
  );
}
