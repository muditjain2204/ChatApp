import express from "express";
import { checkAuth } from "../controllers/auth.controller";
import { protectRoute } from "../middleware/auth.middleware";
const route = express.Router();

// /api/auth/check
route.get("/check", protectRoute, checkAuth);

export default route;
