import type { Snowflake } from "discord.js";
import type { HytaleConnection, HytaleHostPort } from "../Interfaces/database_types.js";
import database from "../Config/database.js";
import { SelfCache } from "../Config/SelfCache.js";
import { decryptor, encryptor } from "../utility_modules/utility_methods.js";

const hytaleConnectionCache = new SelfCache<string, HytaleConnection | null>(24 * 60 * 60_000);

class HytaleConnectionRepository {
    /**
     * The raw database
     * @param guildId Guild Snowflake
     * @returns HytaleConnection object
     */
    async getGuildConnection(guildId: Snowflake): Promise<HytaleConnection | null> {
        const cache = hytaleConnectionCache.get(guildId);
        if(cache !== undefined) return cache;

        const {rows: data} = await database.query(
            `SELECT * FROM hytaleconnection WHERE guild=$1`,
            [guildId]
        );

        if(data.length) {
            hytaleConnectionCache.set(guildId, data[0]);
            return data[0];
        } else {
            hytaleConnectionCache.set(guildId, null);
            return null;
        }
    }

    /**
     * 
     * @param guildId Guild Snowflake
     * @returns Decrypted host and port
     */
    async getGuildHostPort(guildId: Snowflake): Promise<HytaleHostPort | null> {
        const cache = hytaleConnectionCache.get(guildId);
        if(cache !== undefined) {
            if(cache === null) return cache;

            const pair: HytaleHostPort = {
                host: decryptor(cache.host.toString("hex")),
                port: cache.port
            }

            return pair;
        }

        const {rows: data} = await database.query(
            `SELECT * FROM hytaleconnection WHERE guild=$1`,
            [guildId]
        );

        if(data.length) {
            const pair: HytaleHostPort = {
                host: decryptor(data[0].toString("hex")),
                port: data[0].port
            }

            return pair;
        } else {
            hytaleConnectionCache.set(guildId, null);
            return null;
        }
    }

    /**
     * Insert or update guild's connection to hytale server
     * @param guildId Guild Snowflake
     * @param host Host as a string
     * @param port Host port
     */
    async insert(guildId: Snowflake, host: string, port: number, secret: Buffer) {
        const encrypted_host = encryptor(host);
        const newRow: HytaleConnection = {
            guild: guildId,
            host: Buffer.from(encrypted_host, "hex"),
            port: port,
            secret: secret
        }

        hytaleConnectionCache.set(guildId, newRow);

        await database.query(
            `INSERT INTO hytaleconnection (guild, host, port, secret)
                VALUES($1, $2, $3, $4)
                    ON CONFLICT (guild)
                    DO UPDATE SET host = EXCLUDED.host, port = EXCLUDED.port, secret = EXCLUDED.secret;`,
            [guildId, newRow.host, port, secret]
        );
    }

    /**
     * 
     * @param guildId Guild Snowflake
     * @returns The hex string of guild's secret
     */
    async getSecretHash(guildId: Snowflake): Promise<string | null> {
        const cache = hytaleConnectionCache.get(guildId);
        if(cache !== undefined) {
            if(cache === null) return null;

            return cache.secret.toString("hex");
        }

        const {rows: data} = await database.query(
            `SELECT secret FROM hytaleconnection WHERE guild=$1`,
            [guildId]
        );

        if(data.length) {
            return data[0].secret.toString("hex");
        } else {
            hytaleConnectionCache.set(guildId, null);
            return null;
        }
    }

    async deleteGuild(guildId: Snowflake) {
        await database.query(`DELETE FROM hytaleconnection WHERE guild=$1`, [ guildId ]);
    }
}

const HytaleConnectionRepo = new HytaleConnectionRepository();
export default HytaleConnectionRepo;