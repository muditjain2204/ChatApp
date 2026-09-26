import type { Request, Response } from "express";
import type { Types } from "mongoose";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";

// TypeScript-only types: they validate data during development and emit no JavaScript.
// This documents the authenticated user placed in res.locals by protectRoute.
type AuthLocals = { user: { _id: Types.ObjectId } };
// Gives each controller access to the typed authenticated user in res.locals.
type AuthResponse = Response<unknown, AuthLocals>;
// Ensures routes using /:id receive an id string.
type UserIdParams = { id: string };
// Describes the JSON fields accepted when sending a message.
type SendMessageBody = { text?: string };

// catch values are `unknown` in TypeScript; safely convert them for logging.
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function getUsersForSidebar(_req: Request, res: AuthResponse): Promise<void> {
  try {
    const filteredUsers = await User.find({ _id: { $ne: res.locals.user._id } }).select("-clerkId");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", errorMessage(error));
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getConversationsForSidebar(_req: Request, res: AuthResponse): Promise<void> {
  try {
    const loggedInUserId = res.locals.user._id;//checking if iam sender or reciever

    //there is an agrregation in the mongo db so that are we using here
    const conversations = await Message.aggregate([
        //keep only the message i sent to the received
      { $match: { $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }] } },
      
      //the parter is the another person onthe message not me
      { $group: { _id: { $cond: [{ $eq: ["$senderId", loggedInUserId] }, "$receiverId", "$senderId"] }, lastMessageAt: { $max: "$createdAt" } } },

      //put the most recent conversation at the top
      { $sort: { lastMessageAt: -1 } },

      //loop up each partner user profile ( comes back as an array)
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },

      //pull that profile out of array and make it the document.
      { $replaceRoot: { newRoot: { $first: "$user" } } },

      //hide the private clerkid field from the result
      { $project: { clerkId: 0 } },
    ]);
    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error in getConversationsForSidebar:", errorMessage(error));
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMessages(req: Request<UserIdParams>, res: AuthResponse): Promise<void> {
  try {
    const messages = await Message.find({
        //adding filter
      $or: [
        { senderId: res.locals.user._id, receiverId: req.params.id },
        { senderId: req.params.id, receiverId: res.locals.user._id },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", errorMessage(error));
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function sendMessage(
  // Types req.params as { id: string } and req.body as { text?: string }.
  req: Request<UserIdParams, unknown, SendMessageBody>,
  res: AuthResponse,
): Promise<void> {
  try {
    let image: string | undefined;
    let video: string | undefined;
    if (req.file) {
      if (!hasImageKitConfig()) {
        res.status(500).json({ message: "Media upload is not configured" });
        return;
      }
      const url = await uploadChatMedia(req.file);
      if (req.file.mimetype.startsWith("video/")) video = url;
      else image = url;
    }
    const newMessage = await Message.create({
      senderId: res.locals.user._id,
      receiverId: req.params.id,
      // Only include optional fields when defined; required by exactOptionalPropertyTypes.
      //... this means it unpacks the text inside resulting it will added some text in the objects
      ...(req.body.text ? { text: req.body.text } : {}),
      ...(image ? { image } : {}),
      ...(video ? { video } : {}),
    });

    //now we will add real time message through socket.io
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", errorMessage(error));
    res.status(500).json({ message: "Internal server error" });
  }
}
