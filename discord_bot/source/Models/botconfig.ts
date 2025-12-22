import type { Result } from "pg";

import database from "../Config/database.js";
import type { BotConfig } from "../Interfaces/database_types.js";
import { errorLogHandle } from "../utility_modules/error_logger.js";

export default async function BotConfig(): Promise<Result<BotConfig>> {
    try {
        const result: Result<BotConfig> = await database.query(
            `CREATE TABLE IF NOT EXISTS botconfig(
                id SERIAL PRIMARY KEY,
                backup_db_schedule TEXT
            )`
        );

        return result;
    } catch(error) {
        errorLogHandle(error);
        throw error;
    }
}