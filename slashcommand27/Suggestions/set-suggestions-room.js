const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField } = require("discord.js");
const { Database } = require("st.db")
const suggestionsDB = new Database("/Json-db/Bots/suggestionsDB.json")

module.exports = {

    permissions: {
        mode: "owner" // ← فقط الأونر
    },

    data: new SlashCommandBuilder()
    .setName('set-suggestions-room')
    .setDescription('تحديد روم الاقتراحات')
    .addChannelOption(Option => 
        Option
        .setName('room')
        .setDescription('الروم')
        .setRequired(true)),

async execute(interaction) {
    try {
        const room = interaction.options.getChannel(`room`)
        await suggestionsDB.set(`suggestions_room_${interaction.guild.id}` , room.id)
        return interaction.reply({content:`**تم تحديد الروم بنجاح**`})
    } catch {
        return;
    }
}
}
