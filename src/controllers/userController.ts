//@ts-nocheck
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/userModel.js";
import { createNewUserReqBody, loginUserReqBody } from "../types/types.js";
import ErrorHandler from "../utils/errorHandler.js";
import { generateToken } from "../utils/generateToken.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";

// user registration
export const createUser = async (
    req: Request<{}, {}, createNewUserReqBody>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { _id, name, email, password } = req.body;
        console.log(_id, name, email, password)
        console.log("req body", req.body)

        // Check if required fields are provided
        // if (!_id || !name || !email || !password) {
        //     return next(new ErrorHandler("Please fill all fields", 400));
        // }

        // Check if the user already exists with _id
        const isDuplicate_Id = await UserModel.findById({ _id });
        if (isDuplicate_Id) {
            return next(new ErrorHandler(`Duplicate user Id`, 409));
        }

        // Check if the user already exists with email
        const isUserAlreadyExist = await UserModel.findOne({ email });
        if (isUserAlreadyExist) {
            return next(new ErrorHandler(`You're already registered with ${email}, please log in`, 409));
        }

        // Validate password length manually before hashing password
        if (password.length < 6) {
            return next(new ErrorHandler("Password must be at least 6 characters long", 400));
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const createNewUser = await UserModel.create({
            _id,
            name,
            email,
            password: hashedPassword, // Store hashed password
        });

        res.status(201).json({
            success: true,
            message: `Welcome, ${createNewUser.name}`
        });
    } catch (error) {
        next(error);
    }
};



// update profile
// export const updateUserProfile = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const { id } = req.params;

//         // Find the user by ID
//         const user = await UserModel.findById(id);
//         if (!user) {
//             return next(new ErrorHandler("User not found", 404));
//         }

//         // Update fields if provided
//         if (req.body.name) user.name = req.body.name;
//         if (req.file) user.photo = req.file.path; // Save the photo path
//         if (req.body.gender) user.gender = req.body.gender;
//         if (req.body.dob) user.dob = new Date(req.body.dob);

//         // Save updated user
//         await user.save();

//         res.status(200).json({
//             success: true,
//             message: "Profile updated successfully",
//             user,
//         });
//     } catch (error) {
//         next(error);
//     }
// };

export const updateUserProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        console.log("bodydddddd", req.body)
        console.log("fileeee", req.file)

        // Find the user by ID
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if a new file is uploaded and there is an existing photo
        if (req.file) {
            if (user.photo?.public_id) {
                console.log("Deleting old image with public_id:", user.photo.public_id);
                await deleteFromCloudinary([user.photo.public_id]); // Delete old image
            }

            // Upload the new image to Cloudinary
            const [uploadResult] = await uploadOnCloudinary([req.file]);

            // Update user's photo with the new image's details
            user.photo = {
                public_id: uploadResult.public_id,
                url: uploadResult.url,
            };
        }

        // Update other fields if they are provided
        if (req.body.name) user.name = req.body.name;
        if (req.body.gender) user.gender = req.body.gender;
        if (req.body.dob) user.dob = new Date(req.body.dob);

        // Save updated user data
        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        });
    } catch (error) {
        console.error("Error in updateUserProfile:", error); // Additional error logging
        next(error);
    }
};




// User Login 
export const loginUser = async (
    req: Request<{}, {}, loginUserReqBody>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        // Check if user exists with the given email
        const isUserExist = await UserModel.findOne({ email });
        if (!isUserExist) {
            return next(new ErrorHandler(`Account doesn't exist with: ${email}`, 404));
        }

        // Verify the provided password with the stored hashed password
        const isValidPassword = await bcrypt.compare(password, isUserExist.password);
        if (!isValidPassword) {
            return next(new ErrorHandler("Oops! You've entered incorrect password", 401));
        }

        // Generate and set JWT token
        const token = generateToken(res, {_id: isUserExist._id, email:isUserExist.email } );

        
        // Return success response
        res.status(200).json({
            success: true,
            message: `Welcome back, ${isUserExist.name}`,
            user: isUserExist,
            token, 
        });
    } catch (error) {
        next(error);
    }
};


// get users
export const getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {
        const users = await UserModel.find()
        if (users.length < 1) {
            return next(new ErrorHandler("Oops! There's no user yet", 400))
        }
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            totalUser: users.length,
            users
        });
    } catch (error) {
        next(error)
    }
}


// get user
export const getUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = req.params.id
        const user = await UserModel.findById(id)
        if (!user) {
            return next(new ErrorHandler("Invalid user Id", 401))
        }
        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            user
        });
    } catch (error) {
        next(error)
    }
}


// delete user
export const deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = req.params.id
        const user = await UserModel.findById(id)
        if (!user) {
            return next(new ErrorHandler("Invalid user Id", 401))
        }
        await user.deleteOne()
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            user
        });
    } catch (error) {
        next(error)
    }
}


// user logout
export const logoutUser = async (
    req: Request,
    res: Response,
    next: NextFunction) => {
    try {
        res.clearCookie("accessToken",
            // {
            // httpOnly: true,
            // secure: process.env.NODE_ENV === "production",
            // sameSite: "lax",
            // path: "/" 
            // }
        )
        // Respond with success message
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        next(new ErrorHandler("An error occurred during logout.", 500));
    }
}