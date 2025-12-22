import { BaseGuildTextChannel, ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { ChatCommand } from "../../Interfaces/command.js";
import GuildChatConfigRepo from "../../Repositories/guildchatconfig.js";
import { embed_chatconfig, embed_error, embed_success } from "../../utility_modules/embed_builders.js";
import { GuildChatConfig } from "../../Interfaces/database_types.js";
import { fetchGuildChannel } from "../../utility_modules/discord_helpers.js";
import { errorLogHandle } from "../../utility_modules/error_logger.js";

const chat_config: ChatCommand = {
    data: new SlashCommandBuilder()
        .setName("chat-config")
        .setDescription("Change the configuration of how the cross-platform chat works from bot's end.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand.setName("discord")
                .setDescription("Discord related configuration")
                .addStringOption(option =>
                    option.setName("communication-type")
                        .setDescription("0 - OFF | 1 - Hytale to Discord | 2 - Discord to Hytale | 3 - Bidirectional")
                        .addChoices(
                            {
                                name: "off",
                                value: "0"
                            },
                            {
                                name: "hytale-to-discord",
                                value: "1"
                            },
                            {
                                name: "discord-to-hytale",
                                value: "2"
                            },
                            {
                                name: "bidirectional",
                                value: "3"
                            }
                        )
                        .setRequired(true)
                )
                .addBooleanOption(option =>
                    option.setName("use-time")
                        .setDescription("Whether the messages should contain the current time (hh:mm)")
                )
                .addBooleanOption(option =>
                    option.setName("use-date")
                        .setDescription("Whether te messages should contain the current date")
                )
                .addBooleanOption(option =>
                    option.setName("use-channel")
                        .setDescription("Whether the messages should contain the channel of origin")
                )
        )
        .addSubcommand(subcommand => 
            subcommand.setName("server")
                .setDescription("The channel where server messages will be sent to.")
                .addChannelOption(option =>
                    option.setName("server-channel")
                        .setDescription("The channel to be used for server messages.")
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("info")
                .setDescription("Show the current chat configuration.")
        )
        .toJSON(),
    async execute(interaction) {
        await interaction.deferReply();

        const guild = interaction.guild;
        const options = interaction.options;
        const subcommand = options.getSubcommand();

        if (subcommand === "discord") { // discord-side configuration, must be called first
            const communication_type = Number(options.getString("communication-type", true));
            const use_time = options.getBoolean("use-time") ?? false;
            const use_date = options.getBoolean("use-date") ?? false;
            const use_channel = options.getBoolean("use-channel") ?? false;

            await GuildChatConfigRepo.insert(guild.id, communication_type, use_time, use_date, use_channel);
            const config: GuildChatConfig | null = await GuildChatConfigRepo.getGuildConfig(guild.id);
            if(!config) return await interaction.editReply({
                embeds: [
                    embed_error("Something went wrong about inserting the configuration")
                ]
            });
            return await interaction.editReply({
                embeds: [
                    embed_chatconfig(config)
                ]
            });
        } else if(subcommand === "server") { // server-side configuration
            // check current configuration
            const config = await GuildChatConfigRepo.getGuildConfig(guild.id);

            // if there is no discord-side configuration, give error
            if(!config) return await interaction.editReply({
                embeds: [
                    embed_error(
                            "Run `/chat-config discord` before using this command", 
                            "No configuration found for this guild"
                    )
                ]
            });

            const serverChannel = options.getChannel("server-channel", true) as BaseGuildTextChannel;

            if(config.server && config.server.channel !== serverChannel.id) {
                // if the channel is changed, then delete the webhook from the old channel
                const exChannel = 
                    await fetchGuildChannel(guild, config.server.channel) as BaseGuildTextChannel | null;
                if(exChannel) {
                    const hooks = await exChannel.fetchWebhooks();
                    const serverHook = hooks.get(config.server.webhook);
                    if(serverHook) {
                        try {
                            await serverHook.delete();
                        } catch(error) {
                            errorLogHandle(error);
                        }
                    }
                }
            }
            
            // create webhook
            const hook = await serverChannel.createWebhook({
                name: "Server",
                reason: "Server hycord hook"
            });

            await GuildChatConfigRepo.updateServerChannel(guild.id, serverChannel.id, hook.id);
            return await interaction.editReply({
                embeds: [
                    embed_success(
                        "Server channel updated", 
                        `Guild chat configuration updated server channel to ${serverChannel}`
                    )
                ]
            });
        } else if(subcommand === "info") { // show the current configuration for both server and discord side
            const config = await GuildChatConfigRepo.getGuildConfig(guild.id);
            if(config) {
                return await interaction.editReply({
                    embeds: [
                        embed_chatconfig(config)
                    ]
                });
            } else {
                return await interaction.editReply({
                    embeds: [ 
                        embed_error(
                            "Run `/chat-config discord` before using this command", 
                            "No configuration found for this guild"
                        ) 
                    ]
                });
            }
        }
    },

    cooldown: 5,
    userPermissions: [
        PermissionFlagsBits.Administrator
    ],
    botPermissions: [
        PermissionFlagsBits.SendMessages
    ]
}

export default chat_config;