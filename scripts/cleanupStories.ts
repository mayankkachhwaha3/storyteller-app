import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORIES_DIR = path.join(__dirname, '../public/stories');

// Function to clean up a single story directory
async function cleanupStory(storyId: string) {
  const storyDir = path.join(STORIES_DIR, storyId);
  
  try {
    // Check if directory exists
    await fs.access(storyDir);
    
    // Read metadata
    const metadataPath = path.join(storyDir, 'metadata.json');
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
    
    // Check for issues
    let needsFix = false;
    
    // Check audio file
    if (metadata.audio) {
      const audioPath = path.join(__dirname, '../../public', metadata.audio);
      try {
        await fs.access(audioPath);
      } catch {
        console.log(`Audio file missing for ${storyId}, will regenerate`);
        needsFix = true;
      }
    } else {
      needsFix = true;
    }
    
    // Check cover image
    if (metadata.cover && !metadata.cover.includes(storyId)) {
      console.log(`Cover path mismatch for ${storyId}, will fix`);
      needsFix = true;
    }
    
    // Check title format
    if (metadata.title.startsWith('Story') && metadata.title.length > 20) {
      console.log(`Generic title found for ${storyId}, will regenerate`);
      needsFix = true;
    }
    
    if (needsFix) {
      console.log(`Fixing story: ${storyId}`);
      // Delete the story directory to force regeneration
      await fs.rm(storyDir, { recursive: true, force: true });
      console.log(`Removed story: ${storyId}`);
    }
    
  } catch (error: any) {
    // If metadata.json doesn't exist or other error, remove the directory
    if (error.code === 'ENOENT') {
      console.log(`Removing invalid story directory: ${storyId}`);
      await fs.rm(storyDir, { recursive: true, force: true });
    } else {
      console.error(`Error processing story ${storyId}:`, error);
    }
  }
}

// Main function to clean up all stories
async function cleanupAllStories() {
  try {
    const storyDirs = await fs.readdir(STORIES_DIR, { withFileTypes: true });
    
    for (const dir of storyDirs) {
      if (dir.isDirectory()) {
        await cleanupStory(dir.name);
      }
    }
    
    console.log('Story cleanup completed!');
  } catch (error) {
    console.error('Error during story cleanup:', error);
  }
}

// Run the cleanup
cleanupAllStories().catch(console.error);
