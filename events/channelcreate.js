const { EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/logsDB.json");

module.exports = {
    name: "channelCreate",
    async execute(channel) {

        const channelID = await db.get(`log_channelcreate_${channel.guild.id}`);
        if (!channelID) return;

        const logChannel = channel.guild.channels.cache.get(channelID);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle("📁 تم إنشاء روم")
            .addFields(
                { name: "📌 الروم", value: `${channel}` },
                { name: "📂 النوع", value: channel.type }
            )
            .setColor("#4caf50")
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    }
};
