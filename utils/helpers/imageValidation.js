import * as nsfwjs from 'nsfwjs';
import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';
let model;

export const loadModel = async () => {
    try {
        if (!model) {
            model = await nsfwjs.load();
        }
    } catch (error) {
        throw new Error("Lỗi khi tải mô hình NSFW");
    }
};

export const checkImageViolation = async (imagePath) => {
    try {
        const imageBuffer = fs.readFileSync(imagePath);

        const image = await loadImage(imageBuffer);

        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        const predictions = await model.classify(canvas);

        // Kiểm tra nếu xác suất lớp 'Neutral' > 50%
        const neutralPrediction = predictions.find(item => item.className === 'Neutral');
        if (neutralPrediction && neutralPrediction.probability > 0.5) {
            return {
                imagePath,
                isViolation: false,
                violations: []
            };
        }

        // Kiểm tra các lớp vi phạm nếu 'Neutral' không chiếm ưu thế
        const violations = predictions.filter(item =>
            ['Hentai', 'Porn', 'Sexy', 'Violence', 'Blood'].includes(item.className) && item.probability > 0.8
        );

        return {
            imagePath,
            isViolation: violations.length > 0,
            violations: violations.map(v => v.className)
        };
    } catch (error) {
        console.error(`Lỗi khi kiểm tra vi phạm ảnh: ${imagePath}`, error);
        throw new Error(`Lỗi khi kiểm tra vi phạm ảnh: ${imagePath}`);
    }
};
