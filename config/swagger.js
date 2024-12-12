import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * Thiết lập các tùy chọn cho Swagger
 * @param {number} port - Port mà API của bạn đang chạy
 */
const getSwaggerOptions = (port) => ({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for my application',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwt',
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ['./docs/*.js'], // Đường dẫn đến các file tài liệu Swagger
});

/**
 * Cấu hình Swagger cho Express app
 * @param {Object} app - Express app
 * @param {number} port - Port mà API của bạn đang chạy
 */
const configureSwagger = (app, port) => {
  const swaggerOptions = getSwaggerOptions(port);
  const swaggerSpec = swaggerJSDoc(swaggerOptions);

  // Đăng ký Swagger UI với đường dẫn '/api-docs'
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default configureSwagger;
