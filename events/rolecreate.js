const { EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/logsDB.json");

module.exports = {
    name: "roleCreate",
    async execute(role) {

        const channelID = await db.get(`log_rolecreate_${role.guild.id}`);
        if (!channelID) return;

        const logChannel = role.guild.channels.cache.get(channelID);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle("🎉 تم إنشاء رتبة")
            .addFields(
                { name: "📛 الرتبة", value: `${role}` },
                { name: "🎨 اللون", value: role.hexColor }
            )
            .setColor("#00cc66")
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    }
};
