import type { Snowflake } from "discord.js";
import database from "../Config/database.js";
import { SelfCache } from "../Config/SelfCache.js";

const hycordChannelCache = new SelfCache<string, string>(60 * 60_000);

class HycordChannelRepository {
    /**
     * Insert a new row
     * @param guildId Guild Snowflake
     * @param channelId Channel Snowflake
     */
    async insert(guildId: Snowflake, channelId: Snowflake): Promise<void> {
        const key = `${guildId}:${channelId}`;
        hycordChannelCache.set(key, channelId);
        await database.query(`INSERT INTO hycordchannel (guild, channel) VALUES($1, $2)`,
            [guildId, channelId]
        );
    }

    /**
     * Delete the channel from the guild
     * @param guildId Guild Snowflake
     * @param channelId Channel Snowflake
     */
    async deleteGuildChannel(guildId: Snowflake, channelId: Snowflake): Promise<void> {
        const key = `${guildId}:${channelId}`;
        hycordChannelCache.delete(key);

        await database.query(`DELETE FROM hycordchannel WHERE guild=$1 AND channel=$2`,
            [guildId, channelId]
        );
    }

    /**
     * Whether the channel is assigned as hycord channel or not
     * @param guildId Guild Snowflake
     * @param channelId Channel Snowflake
     * @returns Boolean
     */
    async isHycordChannel(guildId: Snowflake, channelId: Snowflake): Promise<boolean> {
        const key = `${guildId}:${channelId}`;
        const cache = hycordChannelCache.get(key);
        if(cache !== undefined) return true;

        const{rows: data} = await database.query(
            `SELECT EXISTS
                (SELECT 1 FROM hycordchannel WHERE guild=$1 AND channel=$2)`,
            [guildId, channelId]
        );

        if(data[0].exists) {
            hycordChannelCache.set(key, channelId);
            return true;
        } else {
            return false;
        }
    }

    /**
     * 
     * @param guildId Guild Snowflake
     * @returns Snowflake array of all hycord channels of the guild
     */
    async getGuildChannels(guildId: Snowflake): Promise<string[] | null> {
        const cache = hycordChannelCache.getByValue((_, key) => key.startsWith(guildId));
        if(cache !== undefined) return cache;

        const {rows: data} = await database.query(
            `SELECT channel FROM hycordchannel WHERE guild=$1`,
            [guildId]
        );

        if(data.length) {
            const result: string[] = data.map(r => r.channel);
            for(const channel of result) {
                hycordChannelCache.set(`${guildId}:${channel}`, channel);
            }

            return result;
        } else {
            return null;
        }
    }

    /**
     * Delete all channels of the guild
     * @param guildId Guild Snowflake
     */
    async deleteGuild(guildId: Snowflake) {
        hycordChannelCache.deleteByValue((_, key) => key.startsWith(guildId));

        await database.query(`DELETE FROM hycordchannel WHERE guild=$1`,
            [guildId]
        );
    }
}

const HycordChannelRepo = new HycordChannelRepository();
export default HycordChannelRepo;