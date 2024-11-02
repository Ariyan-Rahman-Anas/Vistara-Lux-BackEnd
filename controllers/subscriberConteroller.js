import { SubscriberModel } from "../models/subscriberModel.js";
import ErrorHandler from "../utils/errorHandler.js";
export const doSubscribe = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const isSubscribed = await SubscriberModel.find({ email });
        if (isSubscribed)
            return next(new ErrorHandler("You're already subscribed to VistaruLux", 400));
        const subscriber = await SubscriberModel.create({ name, email });
        res.status(201).json({
            success: true,
            message: "Congrats! You've Subscribed to VistaraLux",
            subscriber
        });
    }
    catch (error) {
        return next(new ErrorHandler("Oops! Failed to do Subscribe", 500));
    }
};
