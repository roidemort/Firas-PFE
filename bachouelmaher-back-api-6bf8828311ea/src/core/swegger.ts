// src/core/swagger.ts
import { Express } from 'express';
import { APP_PREFIX_PATH } from './config';

export const setupSwagger = (app: Express) => {
  try {
    const expressSwagger = require('express-swagger-generator')(app);
    
    const options = {
      swaggerDefinition: {
        info: {
          description: 'Galiocare API Documentation',
          title: 'Galiocare API',
          version: '1.0.0',
        },
        host: process.env.API_HOST || 'localhost:3000',
        basePath: APP_PREFIX_PATH,
        produces: ['application/json'],
        consumes: ['application/json'],
        schemes: ['http', 'https'],
        securityDefinitions: {
          BearerAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: 'Bearer token (Format: Bearer {token})',
          },
        },
      },
      basedir: __dirname,
      files: [
        '../routes/**/*.ts',
        '../routes/**/*.js',
        '../controllers/**/*.ts',
        '../controllers/**/*.js',
      ],
    };

    expressSwagger(options);
    
    console.log('✅ Swagger documentation available at /api-docs');
    return true;
  } catch (error) {
    console.error('❌ Failed to setup Swagger:', error);
    return false;
  }
};