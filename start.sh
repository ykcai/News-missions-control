#!/bin/zsh

echo "Starting backend + frontend…"

# Start backend in a new Terminal window
osascript <<EOF
tell application "Terminal"
    do script "cd /Users/Michael.Cai/Library/CloudStorage/OneDrive-EY/Desktop/mission_control_command_center/mission_control_command_center/backend; \
    if [ ! -d venv ]; then python3 -m venv venv; fi; \
    source venv/bin/activate; \
    pip install -r requirements.txt; \
    python3 -m uvicorn main:app --reload --port 8000 --reload-exclude 'venv/*' --reload-exclude '*.db'"
end tell
EOF

# Start frontend in another Terminal window
osascript <<EOF
tell application "Terminal"
    do script "cd /Users/Michael.Cai/Library/CloudStorage/OneDrive-EY/Desktop/mission_control_command_center/mission_control_command_center/frontend; npm install; npm run dev"
end tell
EOF

echo "Open http://localhost:5173"

# Made with Bob
