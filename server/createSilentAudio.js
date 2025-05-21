// Simple script to create a silent audio file using Node.js
const fs = require('fs');
const path = require('path');

// Create a simple WAV header for a silent audio file
function createSilentWav(duration = 30, sampleRate = 44100, channels = 2) {
  const bytesPerSample = 2; // 16-bit
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = Math.floor(duration * sampleRate) * blockAlign;
  const fileSize = 44 + dataSize - 8; // 44 is WAV header size, -8 because 'RIFF' and fileSize not included

  const buffer = Buffer.alloc(44 + dataSize);
  
  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize, 4);
  buffer.write('WAVE', 8);
  
  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34); // Bits per sample
  
  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  // Fill with zeros (silence)
  buffer.fill(0, 44);
  
  return buffer;
}

// Create the stories directory if it doesn't exist
const storyDir = path.join(__dirname, '..', 'public', 'stories', 'ocean-mystery');
if (!fs.existsSync(storyDir)) {
  fs.mkdirSync(storyDir, { recursive: true });
}

// Create a silent WAV file
const audioPath = path.join(storyDir, 'audio.wav');
const silentAudio = createSilentWav(180); // 3 minutes of silence
fs.writeFileSync(audioPath, silentAudio);

console.log(`Created silent audio file at: ${audioPath}`);
