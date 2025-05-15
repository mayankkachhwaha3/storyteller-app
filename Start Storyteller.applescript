tell application "Terminal"
    -- Start backend server
    do script "cd /Users/mayankkachhwaha/CascadeProjects/storyteller && npm run server"
    
    -- Start frontend in a new tab
    tell application "System Events" to tell process "Terminal" to keystroke "t" using command down
    delay 0.5
    do script "cd /Users/mayankkachhwaha/CascadeProjects/storyteller && npm run dev" in selected tab of the front window
    
    -- Open browser after a short delay
    delay 2
    do shell script "open http://localhost:3000"
    
    activate
end tell
