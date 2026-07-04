const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/ticketDB");

module.exports = {

    permissions: {
        mode: "role",          // Owner + Role
        roleId: "1464623559874973729" // ضع ID الرتبة هنا
    },

    adminsOnly: false,

    data: new SlashCommandBuilder()
        .setName('remove-user')
        .setDescription('Remove a user from the current ticket channel')
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('Select the user to remove')
                .setRequired(true)
        ),
    
    async execute(interaction) {

        const dd = new Database("/Json-db/Bots/ticketDB");
        const supportRoleID = dd.get(`TICKET-PANEL_${interaction.channel.id}`)?.Support;

        if (!interaction.member.roles.cache.has(supportRoleID)) {
            return interaction.reply({ 
                content: `❌ You do not have permission to remove users from this ticket.`, 
                ephemeral: true 
            });
        }

        const member = interaction.options.getMember('user');

        if (!db.has(`TICKET-PANEL_${interaction.channel.id}`)) {
            return interaction.reply({ 
                content: `> This channel isn't a ticket`, 
                ephemeral: true 
            });
        }

        await interaction.channel.permissionOverwrites.edit(member.user.id, {
            ViewChannel: false,
            SendMessages: false
        });

        return interaction.reply({ 
            content: `${member} has been removed from the ticket ${interaction.channel}.` 
        });
    }
};
