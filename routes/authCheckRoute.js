import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
const router = express.Router();
// Endpoint to check if user is authenticated
router.get("/check-auth", isAuthenticated, (req, res) => {
    res.status(200).json({
        success: true,
        message: "User is authenticated",
        user: req.user // Send user data, excluding sensitive information
    });
});
export default router;
