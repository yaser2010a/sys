const { EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/logsDB.json");

module.exports = {
    name: "roleDelete",
    async execute(role) {

        const channelID = await db.get(`log_roledelete_${role.guild.id}`);
        if (!channelID) return;

        const logChannel = role.guild.channels.cache.get(channelID);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle("❌ تم حذف رتبة")
            .addFields(
                { name: "📛 الرتبة", value: role.name }
            )
            .setColor("#cc0000")
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    }
};
