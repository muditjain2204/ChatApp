import express from "express";
import User from "../models/user.model";
import { verifyWebhook } from "@clerk/express/webhooks";


const router  = express.Router();

//this is the prefix that clerk sends to the webhook request
router.post("/", async ( req,res) => {

    try {
         const signingSecret = process.env.CLERK_SIGNING_SECRET;
        if(!signingSecret){
        res.status(503).json({Message:"webhook secret is not provided"});
        return;
    }

    // Throws if the signature or raw request body is invalid.
    const evt = await verifyWebhook(req, { signingSecret});

    if(evt.type === "user.created" || evt.type === "user.updated"){
        const u = evt.data;

        const email = 
        u.email_addresses?.find((e:any) => e.id === u.primary_email_address_id)?.email_address ?? u.email_addresses ?.[0]?.email_address;

        const fullName = 
        [u.first_name, u.last_name].filter(Boolean).join(" ") ||u.username || email?.split("@")[0];

        const user = await User.findOneAndUpdate(
            {clerkId:u.id},
            {clerkId:u.id, email, fullName, profilePic: u.image_url },
            { new:true, upsert:true, setDefaultOnInsert:true },
        );
        console.log(`Clerk user synced to MongoDB: ${user.clerkId}`);
    }

    if(evt.type === "user.deleted"){
        await User.findOneAndDelete({clerkId:evt.data.id!});
        console.log(`Clerk user deleted from MongoDB: ${evt.data.id}`);
    }

    res.status(200).json({ received : true});
    }

    catch(error){
        console.error("Error in Clerk webhook:", error);
        res.status(400).json({message:"webhook verification failed"});
    }
   
    
});

export default router;
