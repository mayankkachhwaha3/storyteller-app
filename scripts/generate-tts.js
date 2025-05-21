import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

// Get the current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure the output directory exists
const outputDir = join(__dirname, '..', 'public', 'stories', 'ocean-mystery');
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

const outputFile = join(outputDir, 'audio.wav');
const storyText = `
The Ocean's Secret. An underwater expedition uncovers ancient secrets beneath the waves.

The deep sea submersible descended into the abyss, its lights barely piercing the darkness of the Marianas Trench. Dr. Elara Voss leaned forward in her seat, her eyes fixed on the sonar display.

"There it is," she whispered, pointing to a large, unnatural shape on the screen. "Right where the coordinates said it would be."

Her co-pilot, Captain Jonas Rhee, adjusted their course. "I've never seen anything like this," he admitted, his voice tense with excitement. "It's not on any of our charts."

As they approached, the shape resolved into what appeared to be the ruins of an ancient city, its spires and domes covered in centuries of coral growth. But what made Elara's breath catch was the strange, glowing symbols that pulsed with an eerie blue light.

"This predates any known civilization by thousands of years," she murmured, her gloved fingers hovering over the camera controls. "How is this possible?"

Their discovery would challenge everything we thought we knew about human history, but first, they had to make it back to the surface to tell the world.
`;

// Try to use the system's TTS to generate the audio
try {
  console.log('Generating TTS audio...');
  
  // On macOS, we can use the 'say' command
  if (process.platform === 'darwin') {
    execSync(`say -v Samantha -o ${outputFile} --file-format=WAVE --data-format=LEI16@44100 "${storyText.replace(/"/g, '\\"')}"`);
    console.log(`Audio generated at: ${outputFile}`);
  } 
  // On Linux, you might have 'espeak' or 'festival' installed
  else if (process.platform === 'linux') {
    execSync(`espeak -w ${outputFile} -v en-us "${storyText}"`);
    console.log(`Audio generated at: ${outputFile}`);
  }
  // On Windows, you might have 'PowerShell' with 'Add-Type -AssemblyName System.Speech'
  else if (process.platform === 'win32') {
    const psScript = `
      Add-Type -AssemblyName System.Speech
      $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
      $speak.SetOutputToWaveFile("${outputFile.replace(/\\/g, '\\\\')}")
      $speak.Speak([System.IO.File]::ReadAllText("${path.join(outputDir, 'story.txt').replace(/\\/g, '\\\\')}"))
      $speak.Dispose()
    `;
    writeFileSync(join(outputDir, 'story.txt'), storyText);
    execSync(`powershell -Command "${psScript}"`);
    console.log(`Audio generated at: ${outputFile}`);
  }
  else {
    console.error('Unsupported platform for TTS generation');
    process.exit(1);
  }
  
  // Create metadata file
  const metadata = {
    id: 'ocean-mystery',
    title: "The Ocean's Secret",
    author: "Marine Adventures",
    genre: "Adventure",
    cover: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
    audio: "/stories/ocean-mystery/audio.wav",
    duration: "6:12",
    description: "An underwater expedition uncovers ancient secrets beneath the waves.",
    text: storyText
  };
  
  writeFileSync(
    join(outputDir, 'metadata.json'), 
    JSON.stringify(metadata, null, 2)
  );
  
  console.log('Metadata file created successfully');
  
} catch (error) {
  console.error('Error generating TTS audio:', error);
  process.exit(1);
}
