import type { Event } from "../../Interfaces/event.js";
import type { Guild } from "discord.js";
import { errorLogHandle } from "../../utility_modules/error_logger.js";
import GuildChatConfigRepo from "../../Repositories/guildchatconfig.js";

export type guildCreateHook = (guild: Guild) => Promise<void>;
const hooks: guildCreateHook[] = [];
export function extend_guildCreate(hook: guildCreateHook) {
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

const guildCreate: Event = {
    name: "guildCreate",
    async execute(guild: Guild) {
        await GuildChatConfigRepo.insertGuildDefault(guild.id);
        await runHooks(guild);
    }
}

export default guildCreate;