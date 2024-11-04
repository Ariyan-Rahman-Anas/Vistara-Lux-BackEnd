// // import multer from "multer"

// // export const singleUpload = multer().single("photo")
// // export const multiUpload = multer().array("photos", 10)


// import multer from "multer";

// // Set up multer with memory storage for handling files as buffers
// const storage = multer.memoryStorage();

// export const multiUpload = multer({ storage }).array("photos", 10);








// multerConfig.ts
import multer from "multer";

// Use memory storage to handle file uploads as buffers
const storage = multer.memoryStorage();

// Single file upload (for profile photo, etc.)
export const singleUpload = multer({ storage }).single("photo");

// Multiple file upload (for product images, galleries, etc.)
export const multiUpload = multer({ storage }).array("photos", 10);  // Limit to 10 files