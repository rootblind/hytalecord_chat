import { 
    ActionRowBuilder, 
    BaseGuildTextChannel, 
    ChannelSelectMenuBuilder, 
    ChannelType, 
    ComponentType, 
    MessageFlags,
    PermissionFlagsBits, 
    SlashCommandBuilder,
} from "discord.js";
import { ChatCommand } from "../../Interfaces/command.js";
import { 
    fetchGuildChannel, 
    fetchHycordGuildChannels, 
    message_collector 
} from "../../utility_modules/discord_helpers.js";
import { embed_hycord_channels, embed_hycord_select_response } from "../../utility_modules/embed_builders.js";
import HycordChannelRepo from "../../Repositories/hycordchannel.js";
import { errorLogHandle } from "../../utility_modules/error_logger.js";

/**
 * /channels posts an embed informing the user about what channels are already assigned. 
 * The message has a channel select menu from where the user can pick TextChannels.
 * 
 * If the TextChannels selected are already assigned, they will be removed; they will be assigned otherwise.
 * 
 * Hycord channels are the ones that emit communication between discord and hytale server
 */
const channels: ChatCommand = {
    data: new SlashCommandBuilder()
        .setName("channels")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription("Assign and remove channels from hycord channels.")
        .toJSON(),
    async execute(interaction) {
        await interaction.deferReply();
        const guild = interaction.guild;
        const hycordChannels = await fetchHycordGuildChannels(guild);

        const embed = embed_hycord_channels(guild, hycordChannels);

        const selectChannels: ChannelSelectMenuBuilder = 
            new ChannelSelectMenuBuilder()
                .setChannelTypes(ChannelType.GuildText)
                .setCustomId("select-hycord-channels")
                .setMaxValues(10)
                .setMinValues(1)
                .setPlaceholder("Select channels...");

        const actionRow = new ActionRowBuilder<ChannelSelectMenuBuilder>()
            .addComponents(selectChannels);

        await interaction.editReply({
            embeds: [ embed ],
            components: [ actionRow ]
        });

        const message = await interaction.fetchReply();

        const collector = await message_collector<ComponentType.ChannelSelect>(
            message,
            {
                componentType: ComponentType.ChannelSelect,
                lifetime: 300_000
            },
            async (selectInteraction) => {
                await selectInteraction.deferReply({flags: MessageFlags.Ephemeral});
                const removed: BaseGuildTextChannel[] = [];
                const added: BaseGuildTextChannel[] = [];
                for(const id of selectInteraction.values) {
                    const channel = await fetchGuildChannel(guild, id) as BaseGuildTextChannel;
                    const exists = hycordChannels.includes(channel);
                    if(exists) {
                        // if the channel already exists as hycord channel, remove it
                        await HycordChannelRepo.deleteGuildChannel(guild.id, id);
                        removed.push(channel);
                    } else {
                        // if it doesn't, register it
                        await HycordChannelRepo.insert(guild.id, id);
                        added.push(channel);
                    }
                }

                await selectInteraction.editReply({
                    embeds: [ embed_hycord_select_response(removed, added) ]
                });

                collector.stop();
            },
            async () => {
                try {
                    await message.delete();
                    await interaction.followUp({
                        content: "Interaction ended.",
                        flags: MessageFlags.Ephemeral
                    });
                } catch(error) {
                    errorLogHandle(error);
                }
            }
        );
    },

    cooldown: 5,
    userPermissions: [ PermissionFlagsBits.Administrator ],
    botPermissions: [ PermissionFlagsBits.SendMessages ]
}

export default channels;