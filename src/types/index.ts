export interface Story {
  id: string;
  title: string;
  author: string;
  genre: string;
  cover: string;
  audio: string;
  duration: string;
  text: string;        // The full story text
  description: string; // Short description of the story
  createdAt?: string;  // ISO date string when the story was created
  updatedAt?: string;  // ISO date string when the story was last updated
}
