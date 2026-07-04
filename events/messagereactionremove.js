const { EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/logsDB.json");

module.exports = {
    name: "messageReactionRemove",
    async execute(reaction, user) {

        if (!reaction.message.guild || user.bot) return;

        const channelID = await db.get(`log_reactionremove_${reaction.message.guild.id}`);
        if (!channelID) return;

        const logChannel = reaction.message.guild.channels.cache.get(channelID);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle("💔 تم إزالة رياكشن")
            .addFields(
                { name: "👤 الشخص", value: `${user}`, inline: true },
                { name: "📌 الروم", value: `${reaction.message.channel}`, inline: true },
                { name: "😊 الرياكشن", value: reaction.emoji.toString(), inline: true },
                { name: "🔗 الرسالة", value: `[اضغط هنا](${reaction.message.url})` }
            )
            .setColor("#ff884d")
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    }
};
