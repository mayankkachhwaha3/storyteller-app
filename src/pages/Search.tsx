import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const recentSearches = ["Mystery", "Sci-Fi", "Adventure", "Romance"];
const popularGenres = ["Thriller", "Fantasy", "Horror", "Biography"];

export default function Search() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search/${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="flex-1 px-5 py-6 pb-24">
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories, authors, or genres"
            className="w-full bg-zinc-800 rounded-lg px-4 py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50"
            autoFocus
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400">
            🔍
          </div>
        </div>
      </form>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Recent Searches</h2>
        <div className="flex flex-wrap gap-2">
          {recentSearches.map((search, index) => (
            <button
              key={index}
              onClick={() => navigate(`/search/${encodeURIComponent(search)}`)}
              className="px-4 py-2 bg-zinc-800 rounded-full text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              {search}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Popular Genres</h2>
        <div className="grid grid-cols-2 gap-3">
          {popularGenres.map((genre, index) => (
            <button
              key={index}
              onClick={() => navigate(`/search/${encodeURIComponent(genre)}`)}
              className="bg-zinc-800 rounded-xl p-4 text-center hover:bg-zinc-700/50 transition-colors"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                📚
              </div>
              <span className="text-sm font-medium">{genre}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
