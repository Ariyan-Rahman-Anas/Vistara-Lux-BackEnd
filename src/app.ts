import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import NodeCache from "node-cache";
import morgan from "morgan"
import Stripe from "stripe";
import cors from "cors"
import passport from "passport"
dotenv.config();

// all routes
import userRouter from "./routes/userRoute.js";
import productRoute from "./routes/productRoute.js";
import orderRoute from "./routes/orderRoute.js"
import paymentRoute from "./routes/paymentRoute.js"
import adminStatsRoute from "./routes/adminStatsRoute.js"

import { connectDB } from "./utils/connectDB.js";
import { errorsMiddleware } from "./middlewares/errors.js";

const port = process.env.PORT || 3001;
const stripeKey = process.env.STRIPE_KEY || ""

export const stripe = new Stripe(stripeKey)

export const dataCaching = new NodeCache()

const app = express();

app.use(cors({
    // origin: "https://vistaralux.vercel.app",
    // origin: "http://localhost:5173",
    // origin: ["http://localhost:5173", "https://vistaralux.vercel.app"],
    origin: ["https://vistaralux.vercel.app", "http://localhost:5173" ],
    methods: ["POST", "GET", "PUT", "PATCH", "DELETE"],
    credentials: true
}))


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"))

// Root route
app.get("/", (req: Request, res: Response) => {
    // res.status(200).json({
    //     success: true,
    //     message: "Server is running perfectly on... /api/v1"
    // });
    res.status(200).json({
        success: true,
        message: "Server is running perfectly.",
        availableRoutes: ["/api/v1/user", "/api/v1/product", "/api/v1/order", "/api/v1/payment", "/api/v1/admin"]
    });
});



// Use routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute)
app.use("/api/v1/payment", paymentRoute)
app.use("/api/v1/admin", adminStatsRoute)


app.get('/auth/google',
    passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONT_END_URL}/sign-in`
    }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });



// for image uploads
app.use("/uploads", express.static("uploads"))

// Error handling middleware
app.use(errorsMiddleware);

// Start the server only if DB is connected successfully
connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Express server is running on port: http://localhost:${port}`);
        });
    })
    .catch((error: Error) => {
        console.error("Database connection failed:", error.message);
        process.exit(1); 
    });
