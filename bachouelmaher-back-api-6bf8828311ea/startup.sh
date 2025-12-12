#!/bin/bash

# Install dependencies
yarn install

# Sync schema
yarn schema:sync

# Run migrations
yarn migration:run

# Build project
yarn build

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Generate PM2 startup script
pm2 startup