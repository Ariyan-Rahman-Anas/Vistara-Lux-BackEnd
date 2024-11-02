import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
// Load environment variables
dotenv.config();
// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Upload service function
export async function cloudUploader(file) {
    const rowBase = file.buffer.toString("base64");
    const base64 = `data:${file.mimetype};base64,${rowBase}`;
    // Upload image to Cloudinary
    return await cloudinary.uploader.upload(base64);
}
