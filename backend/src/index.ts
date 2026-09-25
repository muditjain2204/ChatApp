// const express = require("express");
import  express from "express";
import "dotenv/config";
import {connectDB} from "./lib/db"; 
import User from "./models/user.model";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import fs from "fs";
import path from "path";
import  job  from "./lib/cron";
import clerkWebhook from "./webhooks/clerk.webhook.js";
const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL;

const publicDir = path.join(process.cwd(), "public");

app.use("/api/webhooks/clerk", express.raw({type:"application/json"}),clerkWebhook)
console.log(process.env.DB_URL);

app.use(express.json());
app.use(cors({origin:FRONTEND_URL, credentials:true}));
app.use(clerkMiddleware());

app.get("/health" , (req, res) => {
    const { message , image , video } = req.body;
    res.status(200).json({ok : true});
});

//if the public directory existss , serve the static filea
//this is the for the production build of the frontend
if(fs.existsSync(publicDir)){
    //
    app.use(express.static(publicDir));

    //
    app.get("/{*any}",(req, res,next) =>{
        res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
    });
}

console.log(process.env.MONGO_URL);
app.listen(PORT, () => {
   connectDB();
    console.log('Server is running on PORT:', PORT);

    if(process.env.NODE_ENV === "production"){
        job.start();
    }
});