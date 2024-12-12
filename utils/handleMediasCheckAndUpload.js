import * as nsfwjs from 'nsfwjs';
import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';
import cloudinary from 'cloudinary';

let model;

// Hàm tải mô hình NSFW và kiểm tra vi phạm ảnh
export const loadModelAndCheckImage = async (imagePath) => {
    try {
        if (!model) {
            model = await nsfwjs.load(); // Tải mô hình NSFW
        }

        const imageBuffer = fs.readFileSync(imagePath);
        const image = await loadImage(imageBuffer); // Tải ảnh vào canvas

        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        // Phân tích dự đoán từ mô hình NSFW
        const predictions = await model.classify(canvas);

        const thresholds = {
            Hentai: 0.5,
            Porn: 0.5,
            Sexy: 0.9,
            Violence: 0.1,
            Blood: 9.5,
        };

        // Kiểm tra lớp 'Neutral' trước, Neutral là ảnh bình thường
        const neutralPrediction = predictions.find(item => item.className === 'Neutral');
        if (neutralPrediction && neutralPrediction.probability > 0.5) {
            return { imagePath, isViolation: false, violations: [] };
        }

        // Kiểm tra các vi phạm
        const violations = predictions.reduce((acc, item) => {
            const threshold = thresholds[item.className];
            if (threshold !== undefined && item.probability > threshold) {
                acc.push({
                    className: item.className,
                    probability: item.probability,
                });
            }
            return acc;
        }, []);

        return { imagePath, isViolation: violations.length > 0, violations };

    } catch (error) {
        console.error(`Lỗi khi kiểm tra vi phạm ảnh (${imagePath}):`, error);
        throw new Error(`Lỗi khi kiểm tra vi phạm ảnh: ${imagePath}`);
    }
};
export const handleImagesCheckAndUpload = async (imgs) => {
    if (!imgs || imgs.length === 0) return { data: [] };

    try {
        const imageChecks = await Promise.all(imgs.map(async (img) => {
            const violation = await loadModelAndCheckImage(img.path);
            return { image: img.path, violation };
        }));

        const flaggedImages = imageChecks.filter(check => check.violation.isViolation);

        if (flaggedImages.length > 0) {
            // Xóa các ảnh vi phạm
            imgs.forEach(img => fs.unlinkSync(img.path));
            return {
                error: "Some images contain inappropriate content",
                violations: flaggedImages.map(img => img.image),
                details: flaggedImages.map(img => ({
                    image: img.image,
                    violations: img.violation.violations,
                })),
            };
        }

        // Upload các ảnh hợp lệ lên Cloudinary
        let imgUrls = [];
        const uploadPromises = imgs.map(img =>
            cloudinary.uploader.upload(img.path)
                .then(result => {
                    fs.unlinkSync(img.path); // Xóa ảnh sau khi upload thành công
                    return result.secure_url;
                })
                .catch(err => {
                    fs.unlinkSync(img.path); // Xóa ảnh nếu có lỗi
                    console.error("Error uploading image:", err);
                    throw err;
                })
        );

        imgUrls = await Promise.all(uploadPromises);

        return { data: imgUrls };
    } catch (error) {
        console.error("Error processing images:", error);
        throw error;
    }
};
export const handleImagesAndVideosCheckAndUpload = async (files) => {
    if (!files || files.length === 0) return { data: [] };

    try {
        const uploadPromises = files.map(file => {
            if (file.mimetype.startsWith("image")) {
                console.log(file.mimetype)
                return cloudinary.uploader.upload(file.path)
                    .then(result => {
                        fs.unlinkSync(file.path); // Xóa ảnh sau khi upload thành công
                        return result.secure_url;
                    }).catch(err => {
                        fs.unlinkSync(file.path); // Xóa ảnh nếu có lỗi
                        console.error("Error uploading image:", err.message);
                        throw err;
                    });
            }

            if (file.mimetype.startsWith("video")) {
                return new Promise((resolve, reject) => {
                    cloudinary.v2.uploader.upload(
                        file.path,
                        {
                            folder: '',
                            resource_type: 'video'
                        },
                        (error, result) => {
                            if (error) {
                                fs.unlinkSync(file.path);
                                console.error("Error uploading video:", error.message);
                                reject(error);
                            } else {
                                fs.unlinkSync(file.path);
                                console.log("Video uploaded successfully:", result.secure_url);
                                resolve(result.secure_url);
                            }
                        }
                    );
                });
            }

            return Promise.reject(new Error(`Unsupported file type: ${file.mimetype}`));
        });

        const fileUrls = await Promise.all(uploadPromises);
        return { data: fileUrls };

    } catch (error) {
        console.error("Error processing files:", error.message);
        throw error;
    }
};


