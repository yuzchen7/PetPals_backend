const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PetPals API',
      version: '1.0.0',
      description: 'API documentation for PetPals backend',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints',
      },
      {
        name: 'Events',
        description: 'Pet reminder and event management',
      },
      {
        name: 'Pet Activities',
        description: 'Pet activity tracking and management',
      },
      {
        name: 'Pets',
        description: 'Pet management endpoints',
      },
      {
        name: 'pet Health',
        description: 'Pet health and wellness endpoints',
      },
    ],
  },
  apis: [
    './src/controllers/*.ts',
  ],
};

module.exports = swaggerJSDoc(options);
