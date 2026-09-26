import type { Request, Response } from "express";
import User from "../models/user.model.js";

export async function checkAuth(
    req: Request,
    res:Response,
) : Promise<void>{
    
    res.status(200).json({ user: res.locals.user });
    


}
