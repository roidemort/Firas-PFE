#!/bin/bash

# Install dependencies
npm install

# Build project
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Generate PM2 startup script
pm2 startup
