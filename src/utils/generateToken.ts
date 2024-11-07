import jwt from "jsonwebtoken";
import { Response } from "express";

interface JwtPayload {
    _id: string;
    email: string;
}

export const generateToken = (res: Response, payload: JwtPayload) => {
    // Check if the JWT Secret Key is defined
    if (!process.env.JWT_SECRET_KEY) {
        throw new Error("JWT Secret Key is not defined in the environment variables.");
    }

    // Define options for JWT
    const options = {
        expiresIn: "7d",
    };

    // Generate JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, options);

    // Set the cookie options
    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none", 
        maxAge: 7 * 24 * 60 * 60 * 1000, 
    });
    return token;
};