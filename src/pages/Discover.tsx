import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StoryCard from "../components/StoryCard";
import GenreChip from "../components/GenreChip";
import storiesData from "../data/stories.json";
import { Story } from "../types";

const genres = ["All", "Fiction", "Mystery", "Romance", "Sci-Fi", "Fantasy"];

export default function Discover() {
  const [activeGenre, setActiveGenre] = useState("All");
  const navigate = useNavigate();
  const stories: Story[] = storiesData;

  return (
    <main className="flex-1 px-5 py-6 pb-24">
      <h1 className="text-2xl font-bold mb-6">Discover</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Genres</h2>
        <div className="flex overflow-x-auto pb-2 -mx-5 px-5">
          <div className="flex space-x-2">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeGenre === genre 
                    ? 'bg-accent text-white' 
                    : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Trending Now</h2>
          <button className="text-sm text-accent">See all</button>
        </div>
        <div className="flex overflow-x-auto pb-4 -mx-5 px-5">
          <div className="flex space-x-4">
            {stories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Popular Authors</h2>
        <div className="grid grid-cols-2 gap-4">
          {['Creative Minds', 'Love Ink', 'Sci-Fi Masters', 'Mystery Writers'].map(author => (
            <div 
              key={author}
              className="bg-zinc-800 rounded-xl p-4 flex items-center space-x-3"
              onClick={() => navigate(`/search/${author}`)}
            >
              <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                {author.charAt(0)}
              </div>
              <span className="font-medium">{author}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
