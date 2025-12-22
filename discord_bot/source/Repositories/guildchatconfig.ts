import type { Snowflake } from "discord.js";
import database from "../Config/database.js";
import { SelfCache } from "../Config/SelfCache.js";
import { GuildChatConfig } from "../Interfaces/database_types.js";

const guildChatConfigCache = new SelfCache<string, GuildChatConfig | null>(60 * 60_000);

class GuildChatConfigRepository {
    /**
     * 
     * @param guildId Guild Snowflake
     * @returns The guild chat config object or null if there is no configuration for the given guild
     */
    async getGuildConfig(guildId: Snowflake): Promise<GuildChatConfig | null> {
        const cache = guildChatConfigCache.get(`${guildId}`);
        if(cache !== undefined) return cache;

        const {rows: data} = await database.query(`SELECT * FROM guildchatconfig WHERE guild=$1`,
            [guildId]
        );

        if(data.length) {
            const config: GuildChatConfig = {
                guild: data[0].guild,
                communication_type: data[0].communication_type,
                use_time: data[0].use_time,
                use_date: data[0].use_date,
                use_channel: data[0].use_channel
            }
            if(data[0].server_channel) {
                config.server = {
                    channel: data[0].server_channel,
                    webhook: data[0].webhook
                }
            }

            guildChatConfigCache.set(`${guildId}`, config);
            return data[0];
        } else {
            guildChatConfigCache.set(`${guildId}`, null);
            return null;
        }
    }

    /**
     * Initiate guild row
     * @param guildId Guild Snowflake
     */
    async insertGuildDefault(guildId: Snowflake): Promise<void> {
        const cache = guildChatConfigCache.get(guildId);
        const config: GuildChatConfig = {
            guild: guildId,
            communication_type: 0,
            use_time: false,
            use_date: false,
            use_channel: false
        }

        if(cache && cache.server) {
            config.server = {
                channel: cache.server.channel,
                webhook: cache.server.webhook
            }
        }

        guildChatConfigCache.set(`${guildId}`, config);

        await database.query(
            `INSERT INTO guildchatconfig(guild) 
                VALUES($1)
                ON CONFLICT (guild) DO NOTHING;`,
            [guildId]
        );
    }

    /**
     * Insert custom configuration
     * @param guildId Guild Snowflake
     * @param communication_type 0 - OFF | 1 - Hytale to Discord | 2 - Discord to Hytale | 3 - Bidirectional
     * @param use_time Whether to use time
     * @param use_date Whether to use date
     * @param use_channel Whether to use the channel of origin
     */
    async insert(
        guildId: Snowflake,
        communication_type: number = 0,
        use_time: boolean = false,
        use_date: boolean = false,
        use_channel: boolean = false
    ): Promise<void> {
        const config: GuildChatConfig = {
            guild: guildId,
            communication_type: communication_type,
            use_time: use_time,
            use_date: use_date,
            use_channel: use_channel
        }

        const cache = guildChatConfigCache.get(guildId);
        if(cache && cache.server) {
            config.server = {
                channel: cache.server.channel,
                webhook: cache.server.webhook
            }
        }

        guildChatConfigCache.set(guildId, config);

        await database.query(
            `INSERT INTO guildchatconfig(guild, communication_type, use_time, use_date, use_channel)
                VALUES($1, $2, $3, $4, $5)
                    ON CONFLICT (guild)
                    DO UPDATE SET communication_type = EXCLUDED.communication_type,
                        use_time = EXCLUDED.use_time,
                        use_date = EXCLUDED.use_date,
                        use_channel = EXCLUDED.use_channel`,
            [guildId, communication_type, use_time, use_date, use_channel]
        );
    }

    /**
     * Update the server_channel of the guild
     * @param guildId Guild Snowflake
     * @param channelId Channel Snowflake
     */
    async updateServerChannel(guildId: Snowflake, channelId: Snowflake, webhookId: Snowflake): Promise<void> {
        const cache = guildChatConfigCache.get(guildId);
        if(cache) {
            cache.server = {
                channel: channelId,
                webhook: webhookId
            }

            guildChatConfigCache.set(guildId, cache);
        }

        await database.query(
            `UPDATE guildchatconfig SET server_channel=$2, webhook=$3 WHERE guild=$1`,
            [guildId, channelId, webhookId]
        );
    }

    async nullServerChannel(guildId: Snowflake): Promise<void> {
        const cache = guildChatConfigCache.get(guildId);
        if(cache) {
            cache.server = null;
        }

        await database.query(`UPDATE guildchatconfig SET server_channel=$2, webhook=$3 WHERE guild=$1`,
            [guildId, null, null]
        );
    }

    /**
     * Delete the guild entry
     * @param guildId Guild Snowflake
     */
    async deleteConfig(guildId: Snowflake) {
        guildChatConfigCache.delete(`${guildId}`);

        await database.query(`DELETE FROM guildchatconfig WHERE guild=$1`, [ guildId ]);
    }
}

const GuildChatConfigRepo = new GuildChatConfigRepository();
export default GuildChatConfigRepo;