const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/ticketDB");

module.exports = {

    permissions: {
        mode: "role",          // Owner + Role
        roleId: "1464623559874973729" // ضع ID الرتبة هنا
    },

    adminsOnly: false,

    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Close the current ticket channel'),
    
    async execute(interaction) {

        const ticket = db.get(`TICKET-PANEL_${interaction.channel.id}`);

        if (!ticket) {
            return interaction.reply({ 
                content: `> This channel isn't a ticket`, 
                ephemeral: true 
            });
        }

        await interaction.channel.permissionOverwrites.edit(ticket.author, { ViewChannel: false });

        const embed2 = new EmbedBuilder()
            .setDescription(`تم اغلاق تذكرة بواسطة ${interaction.user}`)
            .setColor("Yellow");

        const embed = new EmbedBuilder()
            .setDescription("```لوحة فريق الدعم.```")
            .setColor("DarkButNotBlack");

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('delete').setLabel('Delete').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('Open').setLabel('Open').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('Tran').setLabel('Transcript').setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({ embeds: [embed2, embed], components: [row] });

        const logsRoomId = db.get(`LogsRoom_${interaction.guild.id}`);
        const logChannel = interaction.guild.channels.cache.get(logsRoomId);

        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setTitle('Close Ticket')
                .setFields(
                    { name: `Name Ticket`, value: `${interaction.channel.name}` },
                    { name: `Owner Ticket`, value: `${ticket.author}` },
                    { name: `Close BY Ticket`, value: `${interaction.user}` },
                )
                .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

            logChannel.send({ embeds: [logEmbed] });
        }
    }
};
