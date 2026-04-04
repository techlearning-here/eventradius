@echo off
echo Starting frontend server...
cd /d "%~dp0..\frontend"

if not exist node_modules (
    echo Installing dependencies...
    npm install
) else (
    echo Dependencies already installed
)

echo Starting frontend development server...
npm run dev
