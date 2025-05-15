#!/bin/bash

# Change to the project directory
cd "$(dirname "$0")"

echo "🚀 Starting Storyteller App..."

# Start the backend server in a new Terminal window
echo "🌐 Starting backend server (http://localhost:3001)"
osascript -e 'tell app "Terminal" to do script "cd '\''/Users/mayankkachhwaha/CascadeProjects/storyteller'\'' && npm run server"'

# Start the frontend in a new Terminal window
echo "💻 Starting frontend development server (http://localhost:3000)"
osascript -e 'tell app "Terminal" to do script "cd '\''/Users/mayankkachhwaha/CascadeProjects/storyteller'\'' && npm run dev"'

echo "✅ Both servers are starting up..."
echo "- Backend: http://localhost:3001"
echo "- Frontend: http://localhost:3000"
echo "\nYou can close this window now."
