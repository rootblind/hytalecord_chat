import { Client, ChatInputCommandInteraction } from "discord.js";
import type { PermissionResolvable, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";

/**
 * The interface for slash commands
 */
interface ChatCommand {
    data: RESTPostAPIChatInputApplicationCommandsJSONBody,
    execute: (
        interaction: ChatInputCommandInteraction<"cached">, 
        client: Client
    ) => Promise<unknown>,
    cooldown: number,
    botPermissions: PermissionResolvable[],
    userPermissions: PermissionResolvable[],
    ownerOnly?: boolean,
    testOnly?: boolean
}

export type { ChatCommand };