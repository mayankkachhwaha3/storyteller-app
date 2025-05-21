import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrateOldStories() {
  try {
    const storiesDir = path.join(process.cwd(), 'public/stories');
    const files = await fs.readdir(storiesDir);
    let migratedCount = 0;
    
    for (const file of files) {
      // Skip directories and non-txt files
      if (!file.endsWith('.txt') || file.startsWith('.')) continue;
      
      const storyId = path.basename(file, '.txt');
      
      // Skip if it's one of our sample stories
      if (['ocean-mystery', 'space-explorer', 'the-cloud-who-wanted-to-shine', 'the-magical-forest'].some(name => file.includes(name))) {
        console.log(`Skipping sample story: ${file}`);
        continue;
      }
      
      const storyDir = path.join(storiesDir, `story-${storyId}`);
      
      // Skip if already migrated
      try {
        await fs.access(storyDir);
        console.log(`Skipping already migrated: ${file}`);
        continue;
      } catch {
        // Directory doesn't exist, proceed with migration
      }
      
      console.log(`Migrating story: ${file}`);
      
      await fs.mkdir(storyDir, { recursive: true });
      
      // Move and rename files
      const moves = [
        fs.rename(
          path.join(storiesDir, file),
          path.join(storyDir, 'story.txt')
        )
      ];
      
      // Handle audio files
      const possibleAudioFiles = [
        `${storyId}.m4a`,
        `audio-${storyId}.wav`,
        `audio-${storyId}.m4a`
      ];
      
      for (const audioFile of possibleAudioFiles) {
        try {
          await fs.access(path.join(storiesDir, audioFile));
          moves.push(
            fs.rename(
              path.join(storiesDir, audioFile),
              path.join(storyDir, 'audio' + path.extname(audioFile))
            )
          );
          break; // Only move the first matching audio file
        } catch {
          // File doesn't exist, try next one
        }
      }
      
      await Promise.all(moves);
      
      // Create metadata
      let content = '';
      try {
        content = await fs.readFile(path.join(storyDir, 'story.txt'), 'utf-8');
      } catch (error) {
        console.error(`Error reading story content for ${file}:`, error);
        continue;
      }
      
      // Try to parse the story ID as a timestamp, fallback to current time if invalid
      let createdAt;
      try {
        createdAt = !isNaN(Number(storyId)) 
          ? new Date(Number(storyId)).toISOString()
          : new Date().toISOString();
      } catch (e) {
        console.warn(`Invalid date for story ${storyId}, using current time`);
        createdAt = new Date().toISOString();
      }
      
      const metadata = {
        id: `story-${storyId}`,
        title: `Story ${storyId}`,
        author: 'AI Storyteller',
        genre: 'Children\'s Fiction',
        duration: '5 min',
        cover: '/covers/default.jpg',
        audio: (await fs.readdir(storyDir)).find(f => f.startsWith('audio.')) || '',
        description: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        text: content,
        createdAt,
        updatedAt: new Date().toISOString()
      };
      
      await fs.writeFile(
        path.join(storyDir, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      );
      
      migratedCount++;
      console.log(`Successfully migrated: ${file} -> ${storyDir}`);
    }
    
    console.log(`\nMigration complete. Migrated ${migratedCount} stories.`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateOldStories();
