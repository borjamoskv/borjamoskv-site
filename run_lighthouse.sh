#!/bin/bash
echo "Building for production..."
npx vite build
echo "Starting Vite preview on port 3030..."
npx vite preview --port 3030 > vite.log 2>&1 &
VITE_PID=$!
echo "Waiting for Vite to start..."
sleep 3
echo "Running Lighthouse..."
npx --yes lighthouse http://localhost:3030 --output json --output-path ./lighthouse.json --chrome-flags="--headless"
echo "Killing Vite (PID: $VITE_PID)..."
kill $VITE_PID
wait $VITE_PID 2>/dev/null
echo "Lighthouse completed."
