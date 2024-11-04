// import { v2 as cloudinary } from "cloudinary";

// export const deleteFromCloudinary = async (publicIds: string[]) => {
//     const promises = publicIds.map((id) => {
//         return new Promise<void>((resolve, reject) => {
//             cloudinary.uploader.destroy(id, (error, result) => {
//                 if (error) return reject(error);
//                 resolve();
//             });
//         });
//     });

//     await Promise.all(promises);
// }






// // cloudinaryDelete.ts
// import { v2 as cloudinary } from "cloudinary";

// export const deleteFromCloudinary = async (publicIds: string[]) => {
//     const deletePromises = publicIds.map((id) => {
//         return new Promise<void>((resolve, reject) => {
//             cloudinary.uploader.destroy(id, (error, result) => {
//                 if (error) return reject(error);
//                 resolve();
//             });
//         });
//     });

//     await Promise.all(deletePromises);
// };





import { v2 as cloudinary } from "cloudinary";

export const deleteFromCloudinary = async (publicIds: string[]) => {
    const deletePromises = publicIds.map((id) => {
        return new Promise<void>((resolve, reject) => {
            cloudinary.uploader.destroy(id, (error, result) => {
                if (error) {
                    console.error("Error deleting image from Cloudinary:", error); // Log error if any
                    return reject(error);
                }
                if (result?.result !== "ok") {
                    console.warn(`Image deletion not successful for id ${id}:`, result); // Log warning if not "ok"
                    return reject(new Error("Deletion unsuccessful"));
                }
                console.log(`Successfully deleted image with id ${id}`);
                resolve();
            });
        });
    });

    await Promise.all(deletePromises);
};