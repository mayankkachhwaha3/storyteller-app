import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

interface StoryMetadata {
  title: string;
  author: string;
  genre: string;
  cover: string;
  audio: string;
  duration: string;
  description: string;
  text: string;
  [key: string]: string;
}

interface Story extends Omit<StoryMetadata, 'text'> {
  id: string;
  text: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Helper function to parse story content
function parseStoryContent(content: string): StoryMetadata {
  const lines = content.split('\n');
  const metadata: Partial<StoryMetadata> = {};
  let text = '';
  let inMetadata = true;

  for (const line of lines) {
    if (inMetadata) {
      if (line.trim() === '') {
        inMetadata = false;
        continue;
      }
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const trimmedKey = key.trim().toLowerCase();
        const value = valueParts.join(':').trim();
        if (trimmedKey && value) {
          metadata[trimmedKey as keyof StoryMetadata] = value;
        }
      }
    } else {
      text += line + '\n';
    }
  }

  // Ensure all required fields have default values
  return {
    title: metadata.title || 'Untitled Story',
    author: metadata.author || 'Unknown Author',
    genre: metadata.genre || 'Uncategorized',
    cover: metadata.cover || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
    audio: metadata.audio || '',
    duration: metadata.duration || '5:00',
    description: metadata.description || 'A captivating story awaits you.',
    text: text.trim()
  };
}

// API Routes
app.get('/api/stories', async (req, res) => {
  try {
    const storiesDir = path.join(__dirname, '../public/stories');
    const files = await fs.readdir(storiesDir);
    
    const stories: Story[] = [];
    
    for (const file of files) {
      if (file.endsWith('.txt')) {
        try {
          const content = await fs.readFile(path.join(storiesDir, file), 'utf-8');
          const storyData = parseStoryContent(content);
          
          // Generate an ID from the filename
          const id = file.replace(/\.txt$/, '');
          
          const story: Story = {
            id,
            title: storyData.title,
            author: storyData.author,
            genre: storyData.genre,
            cover: storyData.cover,
            audio: storyData.audio || `/stories/${id}.mp3`,
            duration: storyData.duration,
            description: storyData.description,
            text: storyData.text
          };
          
          stories.push(story);
        } catch (error) {
          console.error(`Error reading story file ${file}:`, error);
        }
      }
    }
    
    res.json(stories);
  } catch (error) {
    console.error('Error reading stories:', error);
    res.status(500).json({ error: 'Failed to load stories' });
  }
});

// Get a single story by ID
app.get('/api/stories/:id', async (req, res) => {
  try {
    const storyId = req.params.id;
    if (!storyId) {
      return res.status(400).json({ error: 'Story ID is required' });
    }
    
    const storyPath = path.join(__dirname, `../public/stories/${storyId}.txt`);
    
    try {
      const content = await fs.readFile(storyPath, 'utf-8');
      const storyData = parseStoryContent(content);
      
      const story: Story = {
        id: storyId,
        title: storyData.title,
        author: storyData.author,
        genre: storyData.genre,
        cover: storyData.cover,
        audio: storyData.audio || `/stories/${storyId}.mp3`,
        duration: storyData.duration,
        description: storyData.description,
        text: storyData.text
      };
      
      res.json(story);
    } catch (error) {
      console.error(`Error reading story ${storyId}:`, error);
      return res.status(404).json({ error: 'Story not found' });
    }
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ error: 'Failed to fetch story' });
  }
});

// Serve static files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Get a single story by ID
app.get('/api/stories/:id', async (req, res) => {
  try {
    const storiesDir = path.join(__dirname, '../public/stories');
    const files = await fs.readdir(storiesDir);
    
    for (const file of files) {
      if (file.endsWith('.txt')) {
        const content = await fs.readFile(path.join(storiesDir, file), 'utf-8');
        const metadata = parseStoryContent(content);
        const storyId = file.replace('.txt', '');
        
        if (storyId === req.params.id) {
          const story = {
            id: storyId,
            ...metadata,
            text: metadata.text
          };
          return res.json(story);
        }
      }
    }
    
    res.status(404).json({ error: 'Story not found' });
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ error: 'Failed to fetch story' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
