import type { Event } from "../../Interfaces/event.js";
import type { Guild, GuildChannel } from "discord.js";
import HycordChannelRepo from "../../Repositories/hycordchannel.js";
import GuildChatConfigRepo from "../../Repositories/guildchatconfig.js";

const channelDelete: Event = {
    name: "channelDelete",
    async execute(channel: GuildChannel) {
        const guild: Guild = channel.guild;
        await HycordChannelRepo.deleteGuildChannel(guild.id, channel.id);
        await GuildChatConfigRepo.nullServerChannel(guild.id);
    }
}

export default channelDelete;