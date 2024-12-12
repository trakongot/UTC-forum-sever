import dotenv from 'dotenv';
import connectDB from './db/connectDB.js';
import { app } from './socket/socket.js';

import configureCloudinary from './config/cloudinary.js';
import configureMiddleware from './config/middleware.js';
import configureRoutes from './config/routes.js';
import configureSwagger from './config/swagger.js';

// Khởi tạo dotenv và kết nối cơ sở dữ liệu
dotenv.config();
connectDB();
// job.start();

const PORT = process.env.PORT || 5000;

// Thiết lập middleware và các cấu hình khác
configureMiddleware(app);
configureCloudinary();
configureRoutes(app);
configureSwagger(app, PORT);

app.listen(PORT, () => {
  console.log('\x1b[32m%s\x1b[0m', '\n=======================================');
  console.log(
    '\x1b[36m%s\x1b[0m',
    '🚀 Server is running: ',
    `\x1b[34mhttp://localhost:${PORT}\x1b[0m`,
  );
  console.log(
    '\x1b[36m%s\x1b[0m',
    '📄 API Docs: ',
    `\x1b[33mhttp://localhost:${PORT}/api-docs\x1b[0m`,
  );
  console.log('\x1b[32m%s\x1b[0m', '=======================================\n');
});
