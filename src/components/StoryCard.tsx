import { Link } from "react-router-dom";
import { Story } from "../types";

// Default story cover image
const DEFAULT_COVER = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60";

interface StoryCardProps {
  story: Story;
  onClick?: () => void;
}

export default function StoryCard({ story, onClick }: StoryCardProps) {
  // Use the story's cover if available, otherwise use the default cover
  const coverImage = story.cover || DEFAULT_COVER;
  
  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== DEFAULT_COVER) {
      target.src = DEFAULT_COVER;
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <img 
        src={coverImage} 
        alt={story.title}
        className="w-full h-48 object-cover"
        onError={handleImageError}
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{story.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{story.author}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
            {story.genre}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{story.duration}</span>
        </div>
        {story.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
            {story.description}
          </p>
        )}
      </div>
    </div>
  );
}
