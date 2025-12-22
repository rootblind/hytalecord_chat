import rateLimit from "../../Config/upstash.js";

import type { Request, Response, NextFunction } from "express";

const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const key = req.guildId;
        if(!key) {
            return res.status(401).end();
        }
        const { success } = await rateLimit.limit(key);

        if(!success) {
            return res.status(429).json({
                message: "rate-limited"
            });
        }
        
        next();
    } catch(err) {
        console.error(err);

        next(err);
    }
}

export default rateLimiter;