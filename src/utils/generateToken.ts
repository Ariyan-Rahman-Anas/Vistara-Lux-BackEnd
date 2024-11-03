import jwt from "jsonwebtoken";
import { Response } from "express";

interface JwtPayload {
    _id: string;
    email: string;
}

export const generateToken = (res: Response, payload: JwtPayload) => {
    if (!process.env.JWT_SECRET_KEY) {
        throw new Error("JWT Secret Key is not defined in the environment variables.");
    }

    const options = {
        expiresIn: "7d", 
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, options);

    res.cookie("accessToken", token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        // secure: false,
        sameSite: "strict", 
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        path: "/", 
    });

    return token;
};