export interface Story {
  id: string;
  title: string;
  author: string;
  description: string;
  cover: string;
  genre: string;
  duration: string;
  text: string;
  fullText?: string;  // Optional field for backward compatibility
  audio: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocationState {
  story?: Story;
}
