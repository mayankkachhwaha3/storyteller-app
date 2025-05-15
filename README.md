# StoryTeller 

An immersive audio story platform built with React, TypeScript, and Express.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎧 Listen to immersive audio stories
- 📱 Responsive design that works on all devices
- 🔍 Discover content by genre and search
- 💾 Save favorites for offline listening
- 🎨 Beautiful dark theme with green accents
- 🚀 Blazing fast performance with Vite

## 🛠 Tech Stack

- ⚛️ React 18 with TypeScript
- ⚡ Vite for fast development and building
- 🎨 TailwindCSS for styling
- 🔄 React Router for navigation
- 🎵 HTML5 Audio API for playback
- 🖥 Express.js backend for API
- 📦 File-based story management

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm 8+
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/storyteller.git
   cd storyteller
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   # Start both frontend and backend
   npm run dev:full
   ```

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
