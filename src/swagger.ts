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
        name: 'Reminders',
        description: 'Reminders endpoints',
      },
      {
        name: 'Pet Activities',
        description: 'Pet activity tracking',
      },
      {
        name: 'Pets',
        description: 'Pet info endpoints',
      },
    ],
  },
  apis: [
    './src/controllers/*.ts',
  ],
};

module.exports = swaggerJSDoc(options);
