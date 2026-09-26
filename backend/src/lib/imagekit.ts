import ImageKit, { toFile } from "@imagekit/nodejs";
import type { Express } from "express"; // Type-only import for Multer's uploaded-file shape.

const imagekit = new ImageKit({ privateKey:process.env.IMAGEKIT_PRIVATE_KEY });

export function hasImageKitConfig() {
    return Boolean(process.env.IMAGEKIT_PRIVATE_KEY);

}

// originalName= "My Photo (1).png"
// result: "chat-1749300000000-My_Photo__1_.png"
// this helper makes a safe, unique filename for uploaded files.
function createFileName(originalName = "upload") {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `chat-${Date.now()}-${safeName}`;
}

export async function uploadChatMedia(file: Express.Multer.File): Promise<string> {
    const fileName = createFileName(file.originalname);

    const result = await imagekit.files.upload({
        file : await toFile(file.buffer, fileName, { type:file.mimetype}),
        fileName,
        folder:"/chat",
    });
    // ImageKit047s type permits an absent URL, so narrow it before returning `string`.
    if (!result.url) {
        throw new Error("ImageKit did not return an uploaded file URL");
    }
    return result.url;
}
