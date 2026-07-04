const { EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/logsDB.json");

module.exports = {
    name: "messageUpdate",
    async execute(oldMessage, newMessage) {

        if (!newMessage.guild || newMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return;

        const channelID = await db.get(`log_messageupdate_${newMessage.guild.id}`);
        if (!channelID) return;

        const logChannel = newMessage.guild.channels.cache.get(channelID);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle("✏️ تم تعديل رسالة")
            .addFields(
                { name: "👤 المرسل", value: `${newMessage.author}`, inline: true },
                { name: "📌 الروم", value: `${newMessage.channel}`, inline: true },
                { name: "📤 قبل", value: oldMessage.content || "بدون نص" },
                { name: "📥 بعد", value: newMessage.content || "بدون نص" },
                { name: "🔗 رابط الرسالة", value: `[اضغط هنا](${newMessage.url})` }
            )
            .setColor("#ffaa00")
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    }
};
