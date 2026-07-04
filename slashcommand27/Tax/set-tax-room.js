const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/taxDB");

module.exports = {
    permissions: {
        mode: "owner"
    },
    adminsOnly: false,

    data: new SlashCommandBuilder()
        .setName('set-tax-room')
        .setDescription('تحديد روم الضريبة التلقائية')
        .addChannelOption(option =>
            option.setName('room')
                .setDescription('الروم')
                .setRequired(true)),
    async execute(interaction) {
        let room = interaction.options.getChannel(`room`);
        await db.set(`tax_room_${interaction.guild.id}`, room.id);

        return interaction.reply({ content: `**تم تحديد الروم ${room} بنجاح**` });
    }
};
