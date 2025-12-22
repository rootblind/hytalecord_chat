import express from "express";
//import session from "express-session";
import { config } from "dotenv";
import { authenticate } from "./middleware/auth.js";
config();

import type { Client } from "discord.js";
import { get_env_var } from "../utility_modules/utility_methods.js";
import rateLimiter from "./middleware/ratelimit.js";
import messageRoutes from "./routes/messageRoutes.js";

const startServer = async (client: Client) => {
    const serverApp = express();

    //const HOST = get_env_var("SERVER_HOST");
    const PORT = Number(get_env_var("SERVER_PORT"));

    serverApp.use(express.json());
    serverApp.use(authenticate);
    serverApp.use(rateLimiter);

    // routes
    serverApp.use("/bot/message", messageRoutes(client));

    serverApp.listen(PORT);

    console.log("API SERVER STARTED ON PORT: " + PORT);
}


export default startServer;
