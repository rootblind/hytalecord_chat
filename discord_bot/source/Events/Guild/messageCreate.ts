import { GuildChatConfig, HytaleConnection } from "../../Interfaces/database_types";
import type { Event } from "../../Interfaces/event.js";
import { TextChannel, type Guild, type Message } from "discord.js";
import GuildChatConfigRepo from "../../Repositories/guildchatconfig.js";
import HycordChannelRepo from "../../Repositories/hycordchannel.js";
import { decryptor, formatDate, formatTime, sendMessageRequest } from "../../utility_modules/utility_methods.js";
import HytaleConnectionRepo from "../../Repositories/hytaleconnection.js";

const messageCreate: Event = {
    name: "messageCreate",
    async execute(message: Message) {
        if (!message.guild || !message.member || message.author.bot) return;
        const guild: Guild = message.guild;
        const channel = message.channel;

        if (!(channel instanceof TextChannel)) return;

        const config: GuildChatConfig | null = await GuildChatConfigRepo.getGuildConfig(guild.id);
        if (!config) return;

        const is_hycord_channel = await HycordChannelRepo.isHycordChannel(guild.id, channel.id);
        if (!is_hycord_channel) return;

        if (config.communication_type < 2) {
            // communication is not set to discord-to-hytale or bidirectional
            // so send nothing
            return;
        }

        const hytaleConnection: HytaleConnection | null = 
            await HytaleConnectionRepo.getGuildConnection(guild.id);

        if(!hytaleConnection) return;
        const host = decryptor(hytaleConnection.host.toString("hex"));
        const port = hytaleConnection.port;
        const endpoint = hytaleConnection.endpoint;
        let messageSample = "";
        const now = new Date();

        if (config.use_date) messageSample += `${formatDate(now)} | `;
        if (config.use_time) messageSample += `[${formatTime(now)}]: `;
        if (config.use_channel) messageSample += `IN #${channel.name} `;
        messageSample += `from: @${message.author.username}: ${message.content}`;

        await sendMessageRequest(host, port, endpoint, hytaleConnection.secret, messageSample);
    }
}

export default messageCreate;