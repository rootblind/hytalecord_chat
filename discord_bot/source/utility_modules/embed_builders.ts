import { BaseGuildTextChannel, ColorResolvable, EmbedBuilder, Guild } from "discord.js";
import { formatDate, formatTime } from "./utility_methods.js";
import { GuildChatConfig } from "../Interfaces/database_types.js";

/**
 * Embed for general error/invalidation feedback
 * @param description 
 * @param title 
 * @returns Embed
 */
export function embed_error(description: string, title?: string): EmbedBuilder {
    return new EmbedBuilder()
        .setColor("Red")
        .setTitle(title || "Error")
        .setDescription(description);
}

/**
 * Embed for general success feedback
 * @param title The title of the embed
 * @param description The description of the embed
 * @param color The embed color
 * @returns Embed
 */
export function embed_success(title: string, description: string, color: ColorResolvable = "Green"): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
}

/**
 * 
 * @param communication_type 0 - OFF | 1 - Hytale to Discord | 2 - Discord to Hytale | 3 - Bidirectional
 * @param use_time Whether to use current time
 * @param use_date Whether to use current date
 * @param use_channel Whether to use the channel of origin
 * @returns Embed
 */
export function embed_chatconfig(
    config: GuildChatConfig
): EmbedBuilder {
    const type_to_string: Record<number, string> = {
        0: "OFF",
        1: "Hytale to Discord",
        2: "Discord to Hytale",
        3: "Bidirectional"
    };

    const description = `Communication type is set to \`${type_to_string[config.communication_type]}\`.\n`;
    let messageSample = "`";
    const now = new Date();

    if(config.use_date) messageSample += `${formatDate(now)} | `;
    if(config.use_time) messageSample += `[${formatTime(now)}]: `;
    if(config.use_channel) messageSample += `IN #general-chat `;
    messageSample += `from: @Steve\``

    return new EmbedBuilder()
        .setTitle("Chat configuration")
        .setDescription(description + messageSample)
        .setFields(
            {
                name: "Use Time",
                value: String(config.use_time).toUpperCase(),
                inline: true
            },
            {
                name: "Use Date",
                value: String(config.use_date).toUpperCase(),
                inline: true
            },
            {
                name: "Use Channel",
                value: String(config.use_channel).toUpperCase(),
                inline: true
            },
            {
                name: "Server channel",
                value: config.server ? `<#${config.server.channel}>` : "Not configured"
            }
        )
}

/**
 * 
 * @param guild Guild object
 * @param hycordChannels Hycord channels (BaseGuildTextChannel)
 * @param color Embed color
 * @returns Embed
 */
export function embed_hycord_channels(
    guild: Guild, 
    hycordChannels: BaseGuildTextChannel[],
    color: ColorResolvable = "Purple"
): EmbedBuilder {
    let description = `**${guild.name}** hycord channels: `;
    if(hycordChannels.length) {
        description += hycordChannels.join(", ");
    } else {
        description += "No channels assigned.";
    }

    return new EmbedBuilder()
        .setAuthor({
            name: "Hycord channels",
            iconURL: guild.iconURL({extension: "png"})!
        })
        .setColor(color)
        .setDescription(description)
        .setFields(
            {
                name: "Assign Hycord channels",
                value: "Selecting unassigned channels will assign them as hycord channels."
            },
            {
                name: "Unassign Hycord channels",
                value: "Select the channels are already registered, they will be removed"
            }
        );

}

/**
 * 
 * @param removed Removed channels from hycord channels
 * @param added Added channels from hycord channels
 * @param color Embed color
 * @returns Embed
 */
export function embed_hycord_select_response(
    removed: BaseGuildTextChannel[],
    added: BaseGuildTextChannel[],
    color: ColorResolvable = "Aqua"
): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle("Hycord channels selected")
        .setColor(color)
        .addFields(
            {
                name: "Removed channels",
                value: removed.length ? removed.join(", ") : "No channels removed."
            },
            {
                name: "Added channels",
                value: added.length ? added.join(", ") : "No channels added."
            }
        );
}