// Interfaces and types to respect the database tables

import type { Snowflake } from "discord.js"

interface GuildTable {
    id?: number,
    guild: Snowflake
}

interface GuildChannelTable extends GuildTable{
    channel: Snowflake
}

interface GuildRolePair {
    guild: Snowflake,
    role: Snowflake
}

type GuildMessageTable = 
    | (GuildChannelTable & { messageid: Snowflake })
    | (GuildChannelTable & { message: Snowflake })

type GuildChannelWithType =
    | (GuildChannelTable & { channeltype: string })
    | (GuildChannelTable & { type: string })
    | (GuildChannelTable & { eventtype: string })

interface ColumnValuePair {
    column: string,
    value: unknown
}

/**
 *  @param communication_type 0 - OFF | 1 - Hytale to Discord | 2 - Discord to Hytale | 3 - Bidirectional
 *  @param use_time whether to use current time (hh:mm) in messages
 *  @param use_date whether to use current date in messages
 *  @param use_channel whether to specify the channel of origin in messages
 */
export interface GuildChatConfig extends GuildTable {
    communication_type: number,
    use_time: boolean,
    use_date: boolean,
    use_channel: boolean,
    server?: {
        channel: Snowflake,
        webhook: Snowflake
    } | null
}

export interface BotConfig {
    id?: number,
    backup_db_schedule: string | null
}

export interface HytaleConnection extends GuildTable {
    host: Buffer,
    port: number,
    endpoint: string,
    secret: Buffer
}

export interface HytaleHostPort {
    host: string,
    port: number
}

export type {
    GuildTable,
    GuildChannelTable,
    GuildMessageTable,
    GuildChannelWithType,
    GuildRolePair,
    ColumnValuePair
}