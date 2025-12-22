import type { Result } from "pg";

import database from "../Config/database.js";
import type { GuildChannelTable } from "../Interfaces/database_types.js";
import { errorLogHandle } from "../utility_modules/error_logger.js";

export default async function HycordChannel(): Promise<Result<GuildChannelTable>> {
    try {
        const result: Result<GuildChannelTable> = await database.query(
            `CREATE TABLE IF NOT EXISTS hycordchannel(
                id SERIAL PRIMARY KEY,
                guild BIGINT NOT NULL,
                channel BIGINT NOT NULL,
                CONSTRAINT hycordchannel_unique_guild_channel UNIQUE (guild, channel)
            )`
        );

        return result;
    } catch(error) {
        errorLogHandle(error);
        throw error;
    }
}