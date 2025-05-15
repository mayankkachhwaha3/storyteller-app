import { Story } from "../types";

interface StoryMetadata {
  title: string;
  author: string;
  genre: string;
  duration: string;
  cover?: string;
  description?: string;
  audio?: string;
  text?: string;
}

function parseStoryContent(content: string): { metadata: Partial<StoryMetadata>; text: string } {
  const lines = content.split('\n');
  const metadata: Partial<StoryMetadata> = {};
  let textStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    if (!line.includes(':')) {
      textStart = i;
      break;
    }
    
    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':').trim();
    
    switch (key.toLowerCase().trim()) {
      case 'title': metadata.title = value; break;
      case 'author': metadata.author = value; break;
      case 'genre': metadata.genre = value; break;
      case 'duration': metadata.duration = value; break;
      case 'cover': metadata.cover = value; break;
      case 'audio': metadata.audio = value; break;
      case 'description': metadata.description = value; break;
    }
  }

  const text = lines.slice(textStart).join('\n').trim();
  return { metadata, text };
}

// Helper function to generate a unique ID from a string
function generateId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function loadStories(): Promise<Story[]> {
  try {
    // First try to load from the public directory
    let files: string[] = [];
    
    try {
      const response = await fetch('/stories');
      if (response.ok) {
        files = await response.json();
      } else {
        console.warn('Could not load stories directory, falling back to empty list');
      }
    } catch (err) {
      console.warn('Error loading stories directory:', err);
      // Continue with empty files array
    }
    
    const stories: Story[] = [];
    const processedIds = new Set<string>();
    
    // Group files by base name (without extension)
    const fileGroups = files.reduce((groups: Record<string, {mp3?: string; txt?: string}>, file: string) => {
      const match = file.match(/^(.*?)(\.[^.]+)?$/);
      if (match) {
        const baseName = match[1];
        const ext = match[2]?.toLowerCase();
        
        if (!groups[baseName]) {
          groups[baseName] = {};
        }
        
        if (ext === '.mp3') {
          groups[baseName].mp3 = `/stories/${file}`;
        } else if (ext === '.txt') {
          groups[baseName].txt = `/stories/${file}`;
        }
      }
      return groups;
    }, {});
    
    // Process each story
    for (const [baseName, files] of Object.entries(fileGroups)) {
      const { mp3, txt } = files as { mp3?: string; txt?: string };
      
      if (!mp3 && !txt) continue;
      
      try {
        let metadata: Partial<StoryMetadata> = {};
        let text = '';
        
        if (txt) {
          const textResponse = await fetch(txt);
          const content = await textResponse.text();
          const parsed = parseStoryContent(content);
          metadata = parsed.metadata;
          text = parsed.text;
        }
        
        const id = generateId(metadata.title || baseName);
        
        if (processedIds.has(id)) continue;
        processedIds.add(id);
        
        const story: Story = {
          id,
          title: metadata.title || baseName,
          author: metadata.author || 'Unknown Author',
          genre: metadata.genre || 'Uncategorized',
          cover: metadata.cover || 'https://images.unsplash.com/photo-1492011223424-9bbd10dd0be4?w=800&q=80',
          audio: mp3 || metadata.audio || '',
          duration: metadata.duration || '0:00',
          text: text,
          description: metadata.description || ''
        };
        
        stories.push(story);
      } catch (error) {
        console.error(`Error loading story ${baseName}:`, error);
      }
    }

    return stories;
  } catch (error) {
    console.error('Error in loadStories:', error);
    return [];
  }
}
