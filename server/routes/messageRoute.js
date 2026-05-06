// routes/messageRoute.js
import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  getUserForSidebar,
  getMessages,
  sendMessage,
  markMessageAsSeen
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUserForSidebar);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.post("/send/:id", protectRoute, sendMessage);
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);

export default messageRouter;