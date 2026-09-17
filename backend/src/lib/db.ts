import mongoose from "mongoose";
import { connected } from "process";
export {connectDB};
async function connectDB(){
    try {
        const mongoUri = process.env.MONGO_URI

        if(!mongoUri){
            throw new Error("MONGO_URI  is required")
        }

        const conn = await mongoose.connect(mongoUri);

        console.log("MongoDB connected" , conn.connection.host);

    } catch(error){
        const message = error instanceof Error ? error.message: String(error);
        console.error("MongoDB connection error:", message);
        process.exit(1);
        //1 means failed and 0 means success
    }
}

