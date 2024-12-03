// import path from "path";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import theardRoutes from "./routes/threadRoutes.js";

import swaggerUi from 'swagger-ui-express';
import messageRoutes from "./routes/messageRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";


import { v2 as cloudinary } from "cloudinary";
import { app } from "./socket/socket.js";
import job from "./cron/cron.js";

import swaggerSpec from "./utils/config/swagger.js";
import cors from 'cors';

dotenv.config();

connectDB();
job.start();

const PORT = process.env.PORT || 5000;
// const __dirname = path.resolve();
app.use(cors({
	origin: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5500'],
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
}));
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});


const corsOptions = {
	origin: ["http://127.0.0.1:5500","http://localhost:3000"],  // Thay đổi bằng URL của frontend
	methods: ["GET", "POST", "PUT", "DELETE"], // Các phương thức HTTP được phép
	credentials: true,  // Cho phép cookie được gửi kèm trong yêu cầu
  };
  
  // Sử dụng CORS middleware	
app.use(cors(corsOptions));

// Middlewares
app.use(express.json({ limit: "50mb" })); // To parse JSON data in the req.body
app.use(express.urlencoded({ extended: true })); // To parse form data in the req.body
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
// app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/threads", theardRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/notifications", notificationRoutes);




// API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// http://localhost:5000 => backend, frontend

// if (process.env.NODE_ENV === "production") {
// 	app.use(express.static(path.join(__dirname, "/frontend/dist")));

// 	// react app
// 	app.get("*", (req, res) => {
// 		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
// 	});
// }



app.listen(PORT, () => {
	console.log('\x1b[32m%s\x1b[0m', '\n=======================================');
	console.log('\x1b[36m%s\x1b[0m', '🚀 Server is running: ', `\x1b[34mhttp://localhost:${PORT}\x1b[0m`);
	console.log('\x1b[36m%s\x1b[0m', '📄 API Docs: ', `\x1b[33mhttp://localhost:${PORT}/api-docs\x1b[0m`);
	console.log('\x1b[32m%s\x1b[0m', '=======================================\n');
});

