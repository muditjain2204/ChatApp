import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import User from "../models/user.model.js";

export async function protectRoute(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            res.status(404).json({ message: "User profile is not synced yet" });
            return;
        }

        //special object that used to pass down to ur next route handlers or views during single 
        //request response cycle
        res.locals.user = user;
        next();
    } catch (error) {
        console.error("Authentication middleware error:", error);
        res.status(500).json({ message: "Authentication failed" });
    }
}
