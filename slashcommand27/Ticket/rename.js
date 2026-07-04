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
        .setName('rename')
        .setDescription('Rename the current ticket channel')
        .addStringOption(option => 
            option
                .setName('name')
                .setDescription('Enter the new channel name')
                .setRequired(true)
        ),
    
    async execute(interaction) {

        const dd = new Database("/Json-db/Bots/ticketDB");
        const supportRoleID = dd.get(`TICKET-PANEL_${interaction.channel.id}`)?.Support;

        if (!interaction.member.roles.cache.has(supportRoleID)) {
            return interaction.reply({ 
                content: `❌ You do not have permission to rename this ticket.`, 
                ephemeral: true 
            });
        }

        const newName = interaction.options.getString('name');
        const ticketData = db.get(`TICKET-PANEL_${interaction.channel.id}`);
        
        if (!ticketData) {
            return interaction.reply({ 
                content: `> This channel isn't a ticket`, 
                ephemeral: true 
            });
        }

        if (!newName) {
            return interaction.reply({ 
                content: `No new name provided for the ticket channel.`, 
                ephemeral: true 
            });
        }

        await interaction.channel.setName(newName);

        return interaction.reply({ 
            content: `Ticket renamed successfully.`, 
            ephemeral: true 
        });
    }
};
