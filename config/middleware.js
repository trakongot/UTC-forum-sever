import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

/**
 * Thiết lập middlewares cho Express
 */
const configureMiddleware = (app) => {
  // CORS
  app.use(
    cors({
      origin: [
        'http://localhost:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5500',
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }),
  );

  // Body parsers
  app.use(express.json({ limit: '50mb' })); // Parse JSON data
  app.use(express.urlencoded({ extended: true })); // Parse form data

  // Cookie parser
  app.use(cookieParser());
};

export default configureMiddleware;
