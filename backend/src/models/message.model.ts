import mongoose from "mongoose";

//create a schema for the message model
const messageSchema = new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    receiverId:{
        // we make id to the reference to the user.model
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    text:{
        type:String,
    },
    image:{
        type:String,
    },
    video:{
        type:String,
    }
} , {timestamps:true},
);

const Message = mongoose.model("Message" , messageSchema)

export default Message;