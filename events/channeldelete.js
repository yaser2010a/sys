const { EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/logsDB.json");

module.exports = {
    name: "channelDelete",
    async execute(channel) {

        const channelID = await db.get(`log_channeldelete_${channel.guild.id}`);
        if (!channelID) return;

        const logChannel = channel.guild.channels.cache.get(channelID);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle("🗂️ تم حذف روم")
            .addFields(
                { name: "📌 اسم الروم", value: channel.name },
                { name: "📂 النوع", value: channel.type }
            )
            .setColor("#e53935")
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    }
};
