import express from "express";
import User from "../models/user.model";
import { verifyWebhook } from "@clerk/express/webhooks";
import Message from "../models/message.model";
import { stringToToken } from "typescript/unstable/ast";


const router  = express.Router();

//this is the prefix that clerk sends to the webhook request
router.post("/", async ( req,res) => {

    try {
         const signingSecret = process.env.CLERK_SIGNING_SECRET;
        if(!signingSecret){
        res.status(503).json({Message:"webhook secret is not provided"});
        return;
    }

    //clerks verifier expects a web request with the raw body : express.raw gives a buffer
    const payload  = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : String(req.body);
    const request = new Request("http://internal/webhooks/clerk", {
        method:"POST",
        headers: new Headers(req.headers as HeadersInit),
        body:payload,
    });

    //throws if the signature is wrong ot the body was tempered with :  only then do we trust 
    const evt = await verifyWebhook(req, { signingSecret});

    if(evt.type === "user.created" || evt.type === "user.updated"){
        const u = evt.data;

        const email = 
        u.email_addresses?.find((e:any) => e.id === u.primary_email_address_id)?.email_address ?? u.email_addresses ?.[0]?.email_address;

        const fullName = 
        [u.first_name, u.last_name].filter(Boolean).join(" ") ||u.username || email?.split("@")[0];

        await User.findOneAndUpdate(
            {clerkId:u.id},
            {clerkId:u.id, email, fullName, profilePic: u.image_url },
            { new:true, upsert:true, setDefaultOnInsert:true },
        )
    }

    if(evt.type === "user.deleted"){
        await User.findOneAndDelete({clerkId:evt.data.id!});
    }

    res.status(200).json({ received : true});
    }
    catch(error){
        console.error("Error in clerk webhook:", error);
        res.status(400).json({message:"webhook verification failed"});
    }
   
    
});

export default router;
