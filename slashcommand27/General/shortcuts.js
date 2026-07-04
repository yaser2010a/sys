const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const shortcutDB = new Database("./Json-db/Others/shortcutDB.json"); // تأكد من مطابقة المسار

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shortcuts')
        .setDescription('عرض جميع الاختصارات المحددة في هذا السيرفر'),

    async execute(interaction) {
        const allData = shortcutDB.all();
        const guildShortcuts = allData.filter(item => item.ID.endsWith(`_cmd_${interaction.guild.id}`));

        if (guildShortcuts.length === 0) {
            return interaction.reply({ content: "❌ لا توجد اختصارات محددة في هذا السيرفر.", ephemeral: true });
        }

        const list = guildShortcuts.map(item => {
            const commandName = item.ID.replace(`_cmd_${interaction.guild.id}`, "");
            return `• **${commandName}** ⬅️ \`${item.data}\``;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle("📋 قائمة اختصارات الأوامر")
            .setDescription(list)
            .setColor("Blue")
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};