import { BaseGuildTextChannel, Client } from "discord.js";
import type { Request, Response } from "express"
import GuildChatConfigRepo from "../../Repositories/guildchatconfig.js";
import { fetchGuildChannel } from "../../utility_modules/discord_helpers.js";

export const postMessage = async (req: Request, res: Response, client: Client) => {
    const { message } = req.body;
    const guildId = req.header("X-Guild-Id");
    if(!message || !message.content || !message.username || !guildId) {
        return res.status(401).json({
            error: "Missing or invalid arguments!"
        });
    }

    const config = await GuildChatConfigRepo.getGuildConfig(guildId);
    if(!config) {
        return res.status(503).json({
            error: "The guild specified has no configuration registered"
        });
    }

    if(config.communication_type !== 1 && config.communication_type !== 3) {
        // if configuration is not set to hytale-to-discord or bidirectional
        return res.status(400).json({
            error: `The discord bot is not allowing this type of communication currently.
            \nconfig.communication_type !== 1 && config.communication_type !== 3`
        });
    }

    if(!config.server || !config.server.channel || !config.server.webhook) {
        return res.status(503).json({
            error: "The configuration lacks a server channel and webhook to send messages to."
        })
    }

    const serverMessage = `IN: #Server\nFROM **${message.username}**:\n\n${message.content}`;

    try {
        const guild = await client.guilds.fetch(guildId);
        const channel = await fetchGuildChannel(guild, config.server.channel) as BaseGuildTextChannel | null;
        if(!channel) return res.status(503).json({
            error: "The server channel associated to the guild is inaccessible or invalid."
        })

        const channelHooks = await channel.fetchWebhooks();
        const serverHook = channelHooks.get(config.server.webhook);
        if(!serverHook) return res.status(503).json({
            error: "The webhook id is invalid."
        });

        try {
            await serverHook.send(serverMessage);
            return res.status(200).json({
                error: "none",
                response: "Message sent"
            });
        } catch {
            return res.status(503).json({
                error: "Couldn't send the message, the hook or channel is faulty."
            });
        }
    } catch(error) {
        return res.status(401).json(error);
    }

}