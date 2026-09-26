import { Router } from "express";
import {
  getConversationsForSidebar,
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.contoller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

// Router keeps message endpoints separate from the application setup in index.ts.
const router = Router();

// Every message endpoint needs an authenticated user in res.locals.user.
//instead of writting protectRoute in all the endpoints we simply do it here
router.use(protectRoute);
router.get("/users", getUsersForSidebar);
router.get("/conversations", getConversationsForSidebar);
router.get("/:id", getMessages);
// Multer adds the single uploaded `media` file to req.file before the controller runs.
router.post("/send/:id", upload.array("media", 3), sendMessage);

export default router;
