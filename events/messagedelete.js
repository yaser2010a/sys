const { EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/logsDB.json");

module.exports = {
    name: "messageDelete",
    async execute(message) {

        if (!message.guild || message.author?.bot) return;

        const channelID = await db.get(`log_messagedelete_${message.guild.id}`);
        if (!channelID) return;

        const logChannel = message.guild.channels.cache.get(channelID);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle("🗑️ تم حذف رسالة")
            .addFields(
                { name: "👤 المرسل", value: `${message.author}`, inline: true },
                { name: "📌 الروم", value: `${message.channel}`, inline: true },
                { name: "💬 المحتوى", value: message.content || "بدون نص" }
            )
            .setColor("#ff4d4d")
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    }
};
