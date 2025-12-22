import { config } from "dotenv";
config();

import type { Request, Response, NextFunction } from "express";
import { createHash } from "node:crypto";
import HytaleConnectionRepo from "../../Repositories/hytaleconnection.js";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const guildId = req.header("X-Guild-Id");
    const auth = req.header("Authorization");
    
    if(!guildId || !auth?.startsWith("Bearer ")) {
        return res.status(401).end();
    }

    const token = auth.slice(7);
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const guildSecret = await HytaleConnectionRepo.getSecretHash(guildId);

    if(!guildSecret || guildSecret !== tokenHash) {
        return res.status(403).end();
    }

    req.guildId = guildId;

    next();
}
