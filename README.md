# StoryTeller 

An immersive audio story platform built with React, TypeScript, and Express, featuring AI-generated stories and text-to-speech capabilities.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎧 Listen to AI-generated audio stories
- 🤖 Generate unique stories using Ollama
- 🎵 Background lullaby music with volume control
- 📖 View story text alongside audio
- 📱 Responsive design for all devices
- 🎨 Beautiful dark theme with modern UI

## 🛠 Tech Stack

- ⚛️ React 18 with TypeScript
- ⚡ Vite for fast development
- 🎨 TailwindCSS for styling
- 🔄 React Router for navigation
- 🎵 HTML5 Audio API for playback
- 🖥 Express.js backend
- 🤖 Ollama for AI story generation
- 🗣 Coqui TTS for text-to-speech

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Git
- [Ollama](https://ollama.ai/) installed and running
- Xcode Command Line Tools (for macOS)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mayankkachhwaha3/storyteller-app.git
   cd storyteller-app
   ```

2. Install dependencies:
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   cd ..
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```env
   PORT=3001
   OLLAMA_API_URL=http://localhost:11434
   ```

4. Start the development servers:
   ```bash
   # Terminal 1: Start the frontend
   npm run dev
   
   # Terminal 2: Start the backend
   cd server
   npm run dev
   ```

5. Start Ollama (in a new terminal):
   ```bash
   ollama serve
   ```

6. Pull the required model (if not already done):
   ```bash
   ollama pull llama3
   ```

## 🌐 Environment Variables

### Frontend (`.env` in root)
```env
VITE_API_URL=http://localhost:3001
```

### Backend (`.env` in `/server`)
```env
PORT=3001
OLLAMA_API_URL=http://localhost:11434
STORIES_DIR=./public/stories
```

## 🎯 Available Scripts

- `npm run dev` - Start frontend dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `cd server && npm run dev` - Start backend server

## 📂 Project Structure

```
storyteller/
├── public/            # Static files
├── server/            # Express backend
│   ├── public/        # Served static files
│   └── index.ts       # Main server file
├── src/
│   ├── pages/        # Page components
│   ├── components/    # Reusable components
│   ├── types/         # TypeScript types
│   └── App.tsx        # Main app component
└── index.html         # Main HTML entry
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Production Build

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## 📂 Project Structure

```
storyteller/
├── public/            # Static files and assets
│   └── stories/       # Story files (audio and text)
├── server/            # Express server code
├── src/               # Frontend source code
│   ├── assets/        # Images, fonts, etc.
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json      # Frontend TypeScript config
└── tsconfig.server.json  # Server TypeScript config
```

## 🎨 Design System

- **Primary Color**: `#10B981` (Emerald)
- **Background**: Dark theme with `zinc-900` to `zinc-950` gradient
- **Text**: Light text on dark background for better readability
- **Typography**: System font stack with Inter as the primary font

## 📝 Adding New Stories

1. Add your story files to the `public/stories` directory:
   - `.mp3` for audio files
   - `.txt` for story text and metadata

2. Format for story text files:
   ```
   title: Story Title
   author: Author Name
   genre: Genre
   duration: 5:30
   cover: https://example.com/cover.jpg
   description: A brief description of the story
   
   The full story text goes here...
   ```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) for the amazing build tooling
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS framework
- [React Icons](https://react-icons.github.io/react-icons/) for the beautiful icons
