import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tempDir = process.env.TEMP_IMAGE_DIR || 'temp';
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

export const fileUploadMiddleware = multer({ storage });
