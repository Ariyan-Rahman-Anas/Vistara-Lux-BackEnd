// // import { v2 as cloudinary } from "cloudinary";
// // import { CloudinaryStorage } from "multer-storage-cloudinary";
// // import multer from "multer";
export {};
// // // 1. Cloudinary configuration using environment variables
// // cloudinary.config({
// //     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// //     api_key: process.env.CLOUDINARY_API_KEY,
// //     api_secret: process.env.CLOUDINARY_API_SECRET,
// // });
// // // 2. Set up Cloudinary storage engine for multer
// // const storage = new CloudinaryStorage({
// //     cloudinary: cloudinary,
// //     params: async (req: Express.Request, file: Express.Multer.File) => {
// //         return {
// //             folder: "products",  // The folder name where files will be stored on Cloudinary
// //             format: file.mimetype === "image/jpeg" ? "jpeg" : "png",  // Automatically set format to jpeg or png based on mimetype
// //             public_id: file.originalname.split(".")[0],  // Set public_id to the original file name without extension
// //         };
// //     },
// // });
// // // 3. Multer middleware for single and multiple uploads
// // export const singleUpload = multer({ storage }).single("image");
// // export const multipleUpload = multer({ storage }).array("images", 10);
// import { v2 as cloudinary } from "cloudinary";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import multer from "multer";
// // 1. Cloudinary configuration using environment variables
// cloudinary.config({
// cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// api_key: process.env.CLOUDINARY_API_KEY,
// api_secret: process.env.CLOUDINARY_API_SECRET,
// });
// // 2. Set up Cloudinary storage engine for multer
// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: async (req: Express.Request, file: Express.Multer.File) => {
//         // Determine the file format based on the file's mimetype
//         const format = file.mimetype === "image/jpeg" || file.mimetype === "image/jpg"
//             ? "jpg"
//             : file.mimetype === "image/png"
//                 ? "png"
//                 : undefined;
//         if (!format) {
//             throw new Error("Unsupported file format"); // Throw an error if unsupported format
//         }
//         return {
//             folder: "products",  // Folder name on Cloudinary
//             format: format,  // File format based on the mimetype (jpg or png)
//             public_id: file.originalname.split(".")[0],  // Set the public_id to the original file name (without extension)
//         };
//     },
// });
// // 3. Multer middleware for single and multiple uploads
// export const singleUpload = multer({ storage }).single("image");
// export const multipleUpload = multer({ storage }).array("images", 10); // Handle up to 10 images
// // 4. Error handling for unsupported file types (optional)
// export const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
//     if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/png") {
//         cb(null, true); // Accept the file if it matches the supported formats
//     } else {
//         cb(new Error("Only .jpg, .jpeg, and .png formats are allowed"), false); // Reject unsupported formats
//     }
// };
// // Update the multer configuration to use the fileFilter (optional, if you want to filter formats before upload)
// export const singleUploadWithFilter = multer({ storage, fileFilter }).single("image");
// export const multipleUploadWithFilter = multer({ storage, fileFilter }).array("images", 10);
