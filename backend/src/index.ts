// const express = require("express");
import  express from "express";
import "dotenv/config";
import {connectDB} from "./lib/db"; 
import User from "./models/user.model";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";


const app = express();
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;
console.log(process.env.DB_URL);

app.use(express.json());
app.use(cors({origin:FRONTEND_URL, credentials:true}));
app.use(clerkMiddleware());

app.get("/health" , (req, res) => {
    const { message , image , video } = req.body;
    res.status(200).json({ok : true});
});

console.log(process.env.MONGO_URL);
app.listen(PORT, () => {
   connectDB();
    console.log('Server is running on PORT:', PORT)
});