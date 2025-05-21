import express from 'express';
import cors from 'cors';
import path from 'path';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';
import os from 'os';
import axios from 'axios';
import { createReadStream } from 'fs';
import { exec } from 'child_process';
import crypto from 'crypto';

// Helper function to generate a slug from a string
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-'); // Replace multiple - with single -
}

// Helper function to get unique filename
async function getUniqueFilename(baseDir: string, baseName: string, ext: string): Promise<string> {
  let counter = 1;
  let filename = `${baseName}${ext}`;
  
  while (true) {
    try {
      await fs.access(path.join(baseDir, filename));
      filename = `${baseName}-${counter}${ext}`;
      counter++;
    } catch (error) {
      // File doesn't exist, we can use this name
      break;
    }
  }
  
  return filename;
}

// Helper functions
const generateStory = async (theme: string): Promise<Story> => {
  try {
    console.log('1. Starting generateStory with theme:', theme);
    const prompt = `Write a short children's story with the following requirements:
1. Title: A creative, engaging title (1 line)
2. Story: A complete story (at least 3 paragraphs)
3. Moral: A simple moral or lesson (1-2 sentences)

THEME: ${theme}

Format your response exactly like this:
TITLE: [Your story title here]

STORY:
[Your story here]

MORAL:
[The moral of the story]`;
    
    console.log('2. Sending request to Ollama API with prompt:', prompt);
    
    const ollamaUrl = 'http://localhost:11434/api/generate';
    const requestData = {
      model: 'llama2',
      prompt: prompt,
      stream: false
    };
    
    console.log('3. Sending POST request to:', ollamaUrl);
    console.log('4. Request data:', JSON.stringify(requestData, null, 2));
    
    const response = await axios.post(ollamaUrl, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 60000, // 60 seconds timeout
      validateStatus: () => true // Always resolve the promise, even with HTTP errors
    });
    
    console.log('5. Received response from Ollama API');
    console.log('6. Response status:', response.status);
    console.log('7. Response headers:', JSON.stringify(response.headers, null, 2));
    
    if (response.status !== 200) {
      throw new Error(`Ollama API returned status ${response.status}: ${JSON.stringify(response.data)}`);
    }
    
    if (!response.data || typeof response.data !== 'object') {
      console.error('8. Invalid response format from Ollama API. Response:', response.data);
      throw new Error('Invalid response format from Ollama API');
    }
    
    const storyText = response.data.response ? response.data.response.trim() : '';
    console.log('8. Extracted story text, length:', storyText.length);
    
    if (!storyText) {
      console.error('9. Empty story text received from Ollama. Full response:', JSON.stringify(response.data, null, 2));
      throw new Error('Empty story text received from Ollama');
    }
    
    // Generate a unique ID and slug for the story
    const storyId = `story-${Date.now()}`;
    const storiesDir = path.join(process.cwd(), 'public/stories');
    
    // Create a unique directory for this story
    const storyDir = path.join(storiesDir, storyId);
    await fs.mkdir(storyDir, { recursive: true });
    
    // Standardized filenames
    const textFilename = 'story.txt';
    const audioFilename = 'audio.wav';
    const imageFilename = 'cover.jpg';
    
    // Save story text
    const textPath = path.join(storyDir, textFilename);
    await fs.writeFile(textPath, storyText, 'utf8');
    
    // Convert text to speech using Coqui TTS
    console.log('Converting story text to speech with Coqui TTS...');
    const audioPath = path.join(storyDir, audioFilename);
    try {
      await convertToSpeechWithCoqui(storyText, audioPath);
      console.log('Successfully generated audio file at:', audioPath);
    } catch (error) {
      console.error('Error generating audio, using empty file:', error);
      // Create an empty audio file to prevent errors
      await fs.writeFile(audioPath, '');
    }
    
    // Handle cover image
    const defaultCoverPath = path.join(process.cwd(), 'public', 'covers', 'default.jpg');
    const imagePath = path.join(storyDir, imageFilename);
    
    try {
      // Ensure the covers directory exists
      await fs.mkdir(path.dirname(defaultCoverPath), { recursive: true });
      
      // If default cover doesn't exist, download it
      if (!fsSync.existsSync(defaultCoverPath)) {
        console.log('Downloading default cover image...');
        const response = await axios.get('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80', {
          responseType: 'arraybuffer'
        });
        await fs.writeFile(defaultCoverPath, response.data);
      }
      
      // Copy the default cover to the story directory
      await fs.copyFile(defaultCoverPath, imagePath);
    } catch (error) {
      console.error('Error handling cover image:', error);
      // If we can't download the default cover, create an empty file
      await fs.writeFile(imagePath, '');
    }
    
    // Create relative paths for the web
    const relativeDir = path.relative(path.join(process.cwd(), 'public'), storyDir);
    const webPath = (file: string) => `/${path.join(relativeDir, file).replace(/\\/g, '/')}`;
    
    // Parse the story text to extract title, content, and moral
    let title = `Story about ${theme}`;
    let description = `A delightful story about ${theme}`;
    let content = storyText;
    
    // Try to extract title, story, and moral
    const titleMatch = storyText.match(/^TITLE:\s*(.+?)\n/i);
    const storyMatch = storyText.match(/STORY:([\s\S]+?)MORAL:/i);
    const moralMatch = storyText.match(/MORAL:([\s\S]+)$/i);
    
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
    
    if (storyMatch) {
      content = storyMatch[1].trim();
      // Use first paragraph as description if available
      const firstParagraph = content.split('\n\n')[0];
      if (firstParagraph) {
        description = firstParagraph.replace(/\s+/g, ' ').trim();
        if (description.length > 150) {
          description = description.substring(0, 147) + '...';
        }
      }
    }
    
    if (moralMatch) {
      const moral = moralMatch[1].trim();
      // Add moral to the end of the story
      content = `${content}\n\nMoral: ${moral}`;
    }
    
    // Create story metadata with all required fields
    const now = new Date().toISOString();
    const story: Story = {
      id: storyId,
      title: title.trim() || `Story about ${theme}`,
      author: 'AI Storyteller',
      genre: 'Children\'s Fiction',
      duration: '5 min',
      cover: webPath(imageFilename),
      audio: webPath(audioFilename),
      description: description,
      text: content, // Use the parsed content instead of raw storyText
      createdAt: now,
      updatedAt: now
    };
    
    // Save story metadata
    const metadataPath = path.join(storyDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(story, null, 2));
    
    // Also save the story text to a separate file
    const storyTextPath = path.join(storyDir, 'story.txt');
    await fs.writeFile(storyTextPath, storyText, 'utf-8');
    
    console.log('Successfully created story with audio and image');
    return story;
      
  } catch (error: any) {
    console.error('ERROR in generateStory:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', JSON.stringify(error.response.headers, null, 2));
      throw new Error(`Ollama API error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from Ollama API. Request details:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data
      });
      throw new Error('No response received from Ollama API. Is it running?');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up Ollama API request:', error.message);
      throw new Error(`Failed to set up Ollama API request: ${error.message}`);
    }
  }
};

const convertToSpeechWithCoqui = async (text: string, outputPath: string): Promise<void> => {
  try {
    console.log('Starting text-to-speech conversion...');
    
    // Create a temporary text file with the story content
    const tempTextFile = path.join(os.tmpdir(), `tts_${Date.now()}.txt`);
    await fs.writeFile(tempTextFile, text, 'utf8');
    
    // Create directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });
    
    // Use AIFF format which is well-supported by the macOS 'say' command
    const tempAudioFile = path.join(os.tmpdir(), `tts_${Date.now()}.aiff`);
    
    // First convert to AIFF
    const command = `say -f "${tempTextFile}" -o "${tempAudioFile}"`;
    console.log('Executing TTS command:', command);
    
    await new Promise<void>((resolve, reject) => {
      exec(command, async (error) => {
        if (error) {
          console.error('TTS conversion error:', error);
          return reject(new Error(`TTS conversion failed: ${error.message}`));
        }
        
        try {
          // Convert AIFF to WAV using afconvert
          const convertCommand = `afconvert -f WAVE -d LEI16@44100 "${tempAudioFile}" "${outputPath}"`;
          console.log('Converting audio format:', convertCommand);
          
          await new Promise<void>((convertResolve, convertReject) => {
            exec(convertCommand, (convertError) => {
              if (convertError) {
                console.error('Audio format conversion error:', convertError);
                return convertReject(new Error(`Audio format conversion failed: ${convertError.message}`));
              }
              convertResolve();
            });
          });
          
          // Clean up temporary files
          await Promise.all([
            fs.unlink(tempTextFile).catch(console.error),
            fs.unlink(tempAudioFile).catch(console.error)
          ]);
          
          // Verify the output file was created
          await fs.access(outputPath, fs.constants.F_OK);
          console.log('Successfully created audio file at:', outputPath);
          resolve();
          
        } catch (e) {
          reject(e);
        }
      });
    });
    
  } catch (error) {
    console.error('Error in convertToSpeechWithCoqui:', error);
    throw new Error(`Failed to convert text to speech: ${error.message}`);
  }
};

// Configure multer for file uploads
const upload = multer({
  dest: path.join(process.cwd(), 'public/uploads'),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

interface StoryMetadata {
  title: string;
  author: string;
  genre: string;
  cover: string;
  audio: string;
  duration: string;
  description: string;
  text: string;
  [key: string]: string; // All fields are required strings
}

interface StorySummary extends Omit<StoryMetadata, 'text'> {
  id: string;
  title: string;
  author: string;
  genre: string;
  cover: string;
  audio: string;
  duration: string;
  description: string;
  createdAt: string;
  [key: string]: string; // All fields are required strings
}

interface Story extends StorySummary {
  text: string;
  updatedAt: string;
  [key: string]: string; // All fields are required strings
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Serve audio files from the stories directory with logging
app.use('/stories', (req, res, next) => {
  console.log(`Accessing file: ${req.url}`);
  express.static(path.join(process.cwd(), 'public/stories'))(req, res, () => {
    if (res.statusCode === 404) {
      console.error(`File not found: ${req.url}`);
    } else if (res.statusCode === 200) {
      console.log(`Serving file: ${req.url}`);
      // Set CORS headers for audio files
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    next();
  });
});

// API Documentation
app.get('/api', (req, res) => {
  res.json({
    message: "StoryTeller API",
    endpoints: {
      stories: {
        get: "/api/stories",
        description: "Get list of available stories"
      },
      generate: {
        post: "/api/generate",
        description: "Generate a new story based on theme"
      },
      upload: {
        post: "/api/upload",
        description: "Upload new story with files"
      },
      tts: {
        post: "/api/tts",
        description: "Convert text to speech"
      }
    }
  });
});

// Story Generation Endpoint
app.post('/api/generate', async (req, res) => {
  console.log('\n=== New Story Generation Request ===');
  console.log('1. Request received at:', new Date().toISOString());
  console.log('2. Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { theme } = req.body;
    
    if (!theme) {
      console.error('3. Error: Theme is required');
      return res.status(400).json({ error: 'Theme is required' });
    }

    console.log(`3. Starting story generation for theme: "${theme}"`);
    
    // Generate story using Ollama
    console.log('4. Calling generateStory...');
    const story = await generateStory(theme);
    console.log('5. Story generated successfully');
    
    // Ensure the story text is not empty
    if (!story.text || story.text.trim().length === 0) {
      throw new Error('Generated story text is empty');
    }
    
    // Create stories directory if it doesn't exist
    console.log('6. Ensuring stories directory exists...');
    await fs.mkdir(path.join(process.cwd(), 'public/stories'), { recursive: true });
    
    // Save story with audio path and ensure all required fields are included
    const now = new Date().toISOString();
    const storyWithAudio: Story = {
      id: story.id,
      title: story.title,
      author: story.author,
      genre: story.genre,
      cover: story.cover,
      audio: `/stories/${story.id}.m4a`,
      duration: story.duration,
      description: story.description,
      text: story.text,
      createdAt: story.createdAt || now,
      updatedAt: now
    };

    // Save story text to .txt file
    const txtPath = path.join(process.cwd(), 'public/stories', `${story.id}.txt`);
    console.log('7. Saving story text to:', txtPath);
    const storyContent = `Title: ${story.title}\n` +
      `Author: ${story.author}\n` +
      `Genre: ${story.genre}\n` +
      `Duration: ${story.duration}\n` +
      `Cover: ${story.cover}\n` +
      `Audio: ${storyWithAudio.audio}\n` +
      `Description: ${story.description}\n\n` +
      `${story.text}`;
    
    await fs.writeFile(txtPath, storyContent);
    console.log('8. Story text saved successfully');

    // Convert story to speech using the new function
    console.log('9. Starting text-to-speech conversion...');
    
    // Ensure the stories directory exists
    const storiesDir = path.join(process.cwd(), 'public/stories');
    await fs.mkdir(storiesDir, { recursive: true });
    
    const audioFilename = `audio-${Date.now()}.wav`;
    const finalAudioPath = path.join(storiesDir, audioFilename);
    
    console.log(`Generating audio file at: ${finalAudioPath}`);
    await convertToSpeechWithCoqui(story.text, finalAudioPath);
    console.log('10. TTS completed successfully');
    
    // Update the story with the audio path and include the full text in the response
    const responseStory = {
      ...story,  // Use the original story which contains the full text
      audio: `/stories/${audioFilename}`,  // Update the audio path
      // Ensure all required fields are included
      id: story.id || storyWithAudio.id,
      title: story.title || storyWithAudio.title,
      author: story.author || storyWithAudio.author,
      genre: story.genre || storyWithAudio.genre,
      cover: story.cover || storyWithAudio.cover,
      duration: story.duration || storyWithAudio.duration,
      description: story.description || storyWithAudio.description,
      // Preserve the full text
      text: story.text || storyWithAudio.text,
      fullText: story.text || storyWithAudio.text,  // Include a backup field for the full text
      createdAt: story.createdAt || storyWithAudio.createdAt,
      updatedAt: story.updatedAt || storyWithAudio.updatedAt
    };

    console.log('12. Story generation completed successfully');
    console.log('Sending response with story:', JSON.stringify(responseStory, null, 2));
    
    // Log the actual text being sent
    console.log('Story text length:', responseStory.text?.length || 0);
    console.log('Story text preview:', responseStory.text?.substring(0, 100) || 'No text');
    
    res.status(200).json(responseStory);
    
  } catch (error) {
    console.error('\n=== ERROR IN STORY GENERATION ===');
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more detailed error information
    const errorResponse = {
      error: 'Failed to generate story',
      message: error.message,
      details: error.details || 'No additional details available',
      timestamp: new Date().toISOString()
    };
    
    console.error('Sending error response:', JSON.stringify(errorResponse, null, 2));
    res.status(500).json(errorResponse);
  }
});

// TTS Conversion Endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Create a temporary file for the audio
    const tempDir = path.join(process.cwd(), 'public/temp');
    await fs.mkdir(tempDir, { recursive: true });
    const audioPath = path.join(tempDir, `tts-${Date.now()}.wav`);
    
    // Convert text to speech
    await convertToSpeechWithCoqui(text, audioPath);
    
    // Return the relative path
    const relativePath = `/temp/${path.basename(audioPath)}`;
    res.status(200).json({ audio: relativePath });
    
    // Clean up the file after 1 hour
    setTimeout(async () => {
      try {
        await fs.unlink(audioPath);
        console.log(`Cleaned up temporary audio file: ${audioPath}`);
      } catch (e) {
        console.error('Error cleaning up temporary audio file:', e);
      }
    }, 3600000); // 1 hour in milliseconds
    
  } catch (error) {
    console.error('Error converting to speech:', error);
    res.status(500).json({ 
      error: 'Failed to convert text to speech',
      message: error.message 
    });
  }
});

// File upload endpoint
app.post('/api/upload', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'lullaby', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, text, genre, author, duration, description } = req.body;
    
    if (!title || !text || !genre || !author || !duration || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Process uploaded files
    const files = {
      audio: (req.files as any)?.audio?.[0],
      lullaby: (req.files as any)?.lullaby?.[0],
      cover: (req.files as any)?.cover?.[0]
    };

    // Create story metadata
    const story = {
      title,
      text,
      genre,
      author,
      duration,
      description,
      audio: files.audio ? `/uploads/${files.audio.filename}` : '',
      lullaby: files.lullaby ? `/uploads/${files.lullaby.filename}` : '',
      cover: files.cover ? `/uploads/${files.cover.filename}` : '',
      timestamp: new Date().toISOString()
    };

    // Save story metadata
    await fs.writeFile(
      path.join(process.cwd(), 'public/stories', `${title.toLowerCase().replace(/\s+/g, '-')}.json`),
      JSON.stringify(story, null, 2)
    );

    res.status(200).json({ message: 'Story uploaded successfully', story });
  } catch (error) {
    console.error('Error uploading story:', error);
    res.status(500).json({ error: 'Failed to upload story' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

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
        const trimmedKey = key.trim().toLowerCase() as keyof StoryMetadata;
        const value = valueParts.join(':').trim();
        if (trimmedKey && value) {
          // Only assign if the key exists in StoryMetadata
          if (Object.prototype.hasOwnProperty.call(metadata, trimmedKey)) {
            // Use type assertion to bypass TypeScript's index signature check
            (metadata as any)[trimmedKey] = value;
          }
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
    const storiesDir = path.join(process.cwd(), 'public/stories');
    
    // Ensure the stories directory exists
    try {
      await fs.access(storiesDir);
    } catch (error) {
      console.log('Stories directory does not exist, creating...');
      await fs.mkdir(storiesDir, { recursive: true });
      return res.json([]);
    }
    
    const files = await fs.readdir(storiesDir, { withFileTypes: true });
    const stories: StorySummary[] = [];
    
    // Find all story directories (those starting with 'story-')
    const storyDirs = files
      .filter(file => file.isDirectory() && file.name.startsWith('story-'))
      .map(dir => dir.name);
    
    for (const dir of storyDirs) {
      try {
        const metadataPath = path.join(storiesDir, dir, 'metadata.json');
        
        // Check if metadata.json exists
        try {
          await fs.access(metadataPath);
        } catch (error) {
          console.warn(`Metadata not found for story ${dir}, skipping...`);
          continue;
        }
        
        // Read and parse the metadata
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        let storyData;
        
        try {
          storyData = JSON.parse(metadataContent);
          
          // Ensure required fields exist with proper types
          const storySummary: StorySummary = {
            id: storyData.id || dir,
            title: storyData.title || 'Untitled Story',
            author: storyData.author || 'Unknown Author',
            genre: storyData.genre || 'Uncategorized',
            cover: storyData.cover || '/covers/default.jpg',
            duration: storyData.duration || '5:00',
            description: storyData.description || 'A captivating story',
            createdAt: storyData.createdAt || new Date().toISOString(),
            audio: storyData.audio // Optional field
          };
          
          // Add to stories array
          stories.push(storySummary);
        } catch (parseError) {
          console.error(`Error parsing metadata for ${dir}:`, parseError);
          continue;
        }
      } catch (error) {
        console.error(`Error processing story ${dir}:`, error);
        continue;
      }
    }
    
    // Sort by creation date (newest first)
    stories.sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    
    // Set proper content type and send response
    res.setHeader('Content-Type', 'application/json');
    return res.json(stories);
  } catch (error) {
    console.error('Error listing stories:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to list stories',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
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
    const storyId = req.params.id;
    const storyDir = path.join(process.cwd(), 'public', 'stories', storyId);
    
    // Check if the story directory exists
    try {
      await fs.access(storyDir);
    } catch (error) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Read the metadata file
    const metadataPath = path.join(storyDir, 'metadata.json');
    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      const storyData = JSON.parse(metadataContent);
      
      // If text is not in metadata, try to read from story.txt
      if (!storyData.text) {
        try {
          const storyTextPath = path.join(storyDir, 'story.txt');
          storyData.text = await fs.readFile(storyTextPath, 'utf-8');
        } catch (error) {
          console.error(`Error reading story text for ${storyId}:`, error);
          storyData.text = '';
        }
      }
      
      res.json(storyData);
    } catch (error) {
      console.error(`Error reading metadata for story ${storyId}:`, error);
      res.status(500).json({ error: 'Failed to read story metadata' });
    }
  } catch (error) {
    console.error(`Error getting story ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to load story' });
  }
});

// Start the server
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
