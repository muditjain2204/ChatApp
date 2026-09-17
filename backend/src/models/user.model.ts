//first import database connection 
import mongoose from "mongoose";
import { createDeflate } from "zlib";
//here mongodb also can make an id automatically 
//but we are using clerk so that we have to take reference of it here\

//create a schema for the message model
const userSchema = new mongoose.Schema({

    clerkId:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        requires:true,
        unique:true,

    },

    fullName:{
        type:String,
        required:true,
    },
    profilePic:{
        type:String,
        default:"",
    },
}, {timestamps:true}, //createdAt , updatedAt
);
//updatedAt, createdAt

const User = mongoose.model("USer" , userSchema);

export default User;