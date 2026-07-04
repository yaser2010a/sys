const { EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/logsDB.json");

module.exports = {
    name: "guildBanAdd",
    async execute(ban) {

        const channelID = await db.get(`log_banadd_${ban.guild.id}`);
        if (!channelID) return;

        const logChannel = ban.guild.channels.cache.get(channelID);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle("🔨 تم إعطاء بان")
            .addFields(
                { name: "👤 الشخص", value: `${ban.user}` }
            )
            .setColor("#d32f2f")
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    }
};
