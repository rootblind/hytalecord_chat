import type { Result } from "pg";

import database from "../Config/database.js";
import type { GuildChatConfig } from "../Interfaces/database_types.js";
import { errorLogHandle } from "../utility_modules/error_logger.js";

export default async function GuildChatConfig(): Promise<Result<GuildChatConfig>> {
    try {
        const result: Result<GuildChatConfig> = await database.query(
            `CREATE TABLE IF NOT EXISTS guildchatconfig(
                id SERIAL PRIMARY KEY,
                guild BIGINT NOT NULL,
                communication_type INT DEFAULT 0,
                use_time BOOLEAN DEFAULT FALSE,
                use_date BOOLEAN DEFAULT FALSE,
                use_channel BOOLEAN DEFAULT FALSE,
                server_channel BIGINT,
                webhook BIGINT,
                CONSTRAINT guildchatconfig_unique_guild UNIQUE (guild)
            )`
        );

        return result;
    } catch(error) {
        errorLogHandle(error);
        throw error;
    }
}