import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { ChatCommand } from "../../Interfaces/command.js";
import HytaleConnectionRepo from "../../Repositories/hytaleconnection.js";
import { embed_error, embed_success } from "../../utility_modules/embed_builders.js";
import { createHash, randomBytes } from "node:crypto";
import { pingServerConnection } from "../../utility_modules/utility_methods.js";

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
        .addStringOption(option =>
            option.setName("route")
                .setDescription("The route to the endpoint controller")
                .setMinLength(0)
                .setMaxLength(255)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("endpoint")
                .setDescription("The API endpoint of the server to send messages to.")
                .setMinLength(0)
                .setMaxLength(255)
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
        let route = options.getString("route", true);
        let endpoint = options.getString("endpoint", true);

        // removing the first slash if given since it will be inserted
        if (endpoint.startsWith("/")) endpoint = endpoint.slice(1); 

        // remove starting and ending slashes from route
        if (route.startsWith("/")) route = route.slice(1);
        if (route.endsWith("/")) route = route.slice(0, route.length - 1);

        const checkConnection = await pingServerConnection(host, port, route, "ping");

        if (checkConnection) {
            const secret = randomBytes(32).toString("hex");
            const secretHash = createHash("sha256").update(secret).digest("hex");
            await HytaleConnectionRepo.insert(
                guild.id, 
                host, 
                port, 
                `${route}/${endpoint}`, // registering the route and endpoint together
                Buffer.from(secretHash, "hex")
            ); // register in database

            return await interaction.editReply({
                embeds: [
                    embed_success(
                        "Connection successful",
                        `**${guild.name}** is now connected to ${host}:${port}/${route}/${endpoint}`
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
                        `Connection to ${host}:${port}/${endpoint} failed!\nCheck spelling or if the server is accessible.`,
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