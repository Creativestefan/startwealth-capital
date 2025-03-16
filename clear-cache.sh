#!/bin/bash

# Stop any running Next.js processes
echo "Stopping any running Next.js processes..."
pkill -f "node.*next"

# Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next

# Clear node_modules/.cache
echo "Clearing node_modules cache..."
rm -rf node_modules/.cache

# Restart Next.js development server
echo "Starting Next.js development server..."
npm run dev 