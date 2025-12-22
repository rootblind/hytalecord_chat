import { TextChannel, NewsChannel, VoiceChannel, StageChannel, ForumChannel, MediaChannel, Guild } from "discord.js";
import type { Event } from "../../Interfaces/event.js";
import { GuildChatConfig } from "../../Interfaces/database_types.js";
import GuildChatConfigRepo from "../../Repositories/guildchatconfig.js";

const webhooksUpdate: Event = {
    name: "webhooksUpdate",
    async execute(
        channel: TextChannel | NewsChannel | VoiceChannel | StageChannel | ForumChannel | MediaChannel
    ) {
        const guild: Guild = channel.guild;
        if(channel instanceof TextChannel) {
            const config: GuildChatConfig | null = await GuildChatConfigRepo.getGuildConfig(guild.id);
            const hooks = await channel.fetchWebhooks();
            
            if(config && config.server?.webhook) {
                // if there was a webhook change and the channel where the change happened is
                // guild config server channel
                // then if the server webhook no longer exists, nullify
                const serverHook = hooks.get(config.server.webhook);
                if(!serverHook) {
                    await GuildChatConfigRepo.nullServerChannel(guild.id);
                }
            }
        }
    }
}

export default webhooksUpdate;