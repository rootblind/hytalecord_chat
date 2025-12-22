import type { Event } from "../../Interfaces/event.js";
import type { Guild } from "discord.js";
import { errorLogHandle } from "../../utility_modules/error_logger.js";
import GuildChatConfigRepo from "../../Repositories/guildchatconfig.js";
import HytaleConnectionRepo from "../../Repositories/hytaleconnection.js";
import HycordChannelRepo from "../../Repositories/hycordchannel.js";

export type guildDeleteHook = (guild: Guild) => Promise<void>;
const hooks: guildDeleteHook[] = [];
export function extend_guildDelete(hook: guildDeleteHook) {
    hooks.push(hook);
}

async function runHooks(guild: Guild) {
    for(const hook of hooks) {
        try {
            await hook(guild);
        } catch(error) {
            errorLogHandle(error);
        }
    }
}

const guildDelete: Event = {
    name: "guildDelete",
    async execute(guild: Guild) {
        await GuildChatConfigRepo.deleteConfig(guild.id);
        await HytaleConnectionRepo.deleteGuild(guild.id);
        await HycordChannelRepo.deleteGuild(guild.id);
        await runHooks(guild);
    }
}

export default guildDelete;