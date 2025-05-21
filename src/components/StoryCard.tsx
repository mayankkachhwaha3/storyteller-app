import { Link } from "react-router-dom";
import { Story } from "../types";

// Default story cover image
const DEFAULT_COVER = "/covers/default.jpg";

// Function to format date
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return '';
  }
};

interface StoryCardProps {
  story: Story;
  onClick?: () => void;
  className?: string;
}

export default function StoryCard({ story, onClick, className = '' }: StoryCardProps) {
  // Use the story's cover if available, otherwise use the default cover
  const coverImage = story.cover || DEFAULT_COVER;
  
  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== DEFAULT_COVER) {
      target.src = DEFAULT_COVER;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer h-full flex flex-col ${className}`}
      onClick={handleClick}
      style={{ minHeight: '400px' }}
    >
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <img 
          src={coverImage} 
          alt={story.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={handleImageError}
        />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center justify-between">
            <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
              {story.genre}
            </span>
            {story.duration && (
              <span className="text-xs text-white bg-black/50 px-2 py-1 rounded-full">
                {story.duration}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
          {story.title || 'Untitled Story'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
          {story.description || 'No description available'}
        </p>
        <div className="mt-auto pt-2 flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {story.author || 'Unknown Author'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {story.createdAt ? formatDate(story.createdAt) : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
