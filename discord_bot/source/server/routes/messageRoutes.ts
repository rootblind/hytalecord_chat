import express from "express";
import { postMessage } from "../controllers/messageController.js";

import type { Client } from "discord.js";
import type { Request, Response } from "express";

export default function messageRoutes(client: Client) {
    const router = express.Router();
    router.post("/send", (req: Request, res: Response) => postMessage(req, res, client));

    return router;
}