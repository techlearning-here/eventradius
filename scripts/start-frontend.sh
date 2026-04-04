#!/bin/bash

echo "Starting frontend server..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
else
    echo "Dependencies already installed"
fi

echo "Starting frontend development server..."
npm run dev
