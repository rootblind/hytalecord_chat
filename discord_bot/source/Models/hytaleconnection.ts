import type { Result } from "pg";

import database from "../Config/database.js";
import type { HytaleConnection } from "../Interfaces/database_types.js";
import { errorLogHandle } from "../utility_modules/error_logger.js";

export default async function HytaleConnection(): Promise<Result<HytaleConnection>> {
    try {
        const result: Result<HytaleConnection> = await database.query(
            `CREATE TABLE IF NOT EXISTS hytaleconnection(
                id SERIAL PRIMARY KEY,
                guild BIGINT NOT NULL,
                host BYTEA NOT NULL,
                port INT NOT NULL,
                secret BYTEA NOT NULL,
                CONSTRAINT hytaleconnection_unique_guild UNIQUE (guild)
            )`
        );

        return result;
    } catch(error) {
        errorLogHandle(error);
        throw error;
    }
}