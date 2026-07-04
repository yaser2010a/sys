const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField } = require("discord.js");
const { Database } = require("st.db")
const feedbackDB = new Database("/Json-db/Bots/feedbackDB.json")

module.exports = {

    permissions: {
        mode: "owner" // ← فقط الأونر
    },

    data: new SlashCommandBuilder()
    .setName('set-feedback-room')
    .setDescription('تحديد روم الاراء')
    .addChannelOption(Option => 
        Option
        .setName('room')
        .setDescription('الروم')
        .setRequired(true)),

async execute(interaction) {
    try{
        const room = interaction.options.getChannel(`room`)
        await feedbackDB.set(`feedback_room_${interaction.guild.id}` , room.id)
        return interaction.reply({content:`**تم تحديد الروم بنجاح**`})
    } catch  {
        return;
    }
}
}
