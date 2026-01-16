// scripts/generate-swagger.ts
import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();

// Setup Swagger
const expressSwagger = require('express-swagger-generator')(app);

const options = {
  swaggerDefinition: {
    info: {
      description: 'Galiocare API Documentation',
      title: 'Galiocare API',
      version: '1.0.0',
    },
    host: 'api.galiocare.com',
    basePath: '/api/v1',
    produces: ['application/json'],
    consumes: ['application/json'],
    schemes: ['https'],
    securityDefinitions: {
      BearerAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: 'Bearer token (Format: Bearer {token})',
      },
    },
  },
  basedir: path.join(__dirname, '../src'),
  files: [
    './routes/**/*.ts',
    './http/controllers/**/*.ts',
  ],
};

// Generate Swagger spec
const specs = expressSwagger(options);

// Save to file
const outputPath = path.join(__dirname, '../swagger.json');
fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2));

console.log(`✅ Swagger JSON saved to: ${outputPath}`);
console.log(`📊 Total paths documented: ${Object.keys(specs.paths).length}`);
process.exit(0);