import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { ChatCommand } from "../../Interfaces/command.js";
import HytaleConnectionRepo from "../../Repositories/hytaleconnection.js";
import { embed_error, embed_success } from "../../utility_modules/embed_builders.js";
import { createHash, randomBytes } from "node:crypto";

const connect: ChatCommand = {
    data: new SlashCommandBuilder()
        .setName("connect")
        .setDescription("Connect your guild to a hytale endpoint host.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName("host")
                .setDescription("Hytale endpoint server host")
                .setMaxLength(100)
                .setMinLength(1)
                .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName("port")
                .setDescription("The port of the endpoint")
                .setMaxValue(65535)
                .setMinValue(0)
                .setRequired(true)
        )
        .toJSON()
    ,
    
    async execute(interaction) {
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        const options = interaction.options;
        const guild = interaction.guild;

        const host = options.getString("host", true);
        const port = options.getNumber("port", true);
        /**
         * To be implemented: Check connection
         * After mockup server
         */
        const checkConnection = true; // placehold for the connection verification
        if(checkConnection) {
            const secret = randomBytes(32).toString("hex");
            const secretHash = createHash("sha256").update(secret).digest("hex");
            await HytaleConnectionRepo.insert(guild.id, host, port, Buffer.from(secretHash, "hex")); // register in database
            return await interaction.editReply({
                embeds: [
                    embed_success(
                        "Connection successful",
                        `**${guild.name}** is now connected to ${host}:${port}`
                    ).setFields({
                        name: "Your secret key",
                        value: `||${secret}||`
                    })
                ]
            });
        } else {
            return await interaction.editReply({
                embeds: [
                    embed_error(
                        `Connection to ${host}:${port} failed!\nCheck spelling or if the server is accessible.`,
                        "Unable to connect"
                    )
                ]
            });
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

export default connect;