const { EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/logsDB.json");

module.exports = {
    name: "guildBanRemove",
    async execute(ban) {

        const channelID = await db.get(`log_bandelete_${ban.guild.id}`);
        if (!channelID) return;

        const logChannel = ban.guild.channels.cache.get(channelID);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle("⚖️ تم فك بان")
            .addFields(
                { name: "👤 الشخص", value: `${ban.user}` }
            )
            .setColor("#8bc34a")
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    }
};
