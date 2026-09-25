## what are we using in this project
actuall file of the clerkWebhook is src/webhooks/clerk.webhook.ts
and also we are doing "default export" 

so the matching file is would be 
import clerkWebhook from "./webhooks/clerk.webhook.js";

## what does export default actually do is 
like :-
const router = express.Router();

// configure router.post(...)

export default router;

//this means that "when another file imports this module its primary export is router "

//then we import it without braces and may choose any local name 
import clerkWebhook from "./webhooks/clerk.webhook.js";

//clerkWebhook now refers to the exported router so this works

app.use("/api/webhooks/clerk", express.raw({ type: "application/json" }), clerkWebhook);

by contrast a named export uses braces and requires the declared export name
export const clerkWebhook = router;
import { clerkWebhook } from "./webhooks/clerk.webhook.js";

A module can have many named exports  but only one default export