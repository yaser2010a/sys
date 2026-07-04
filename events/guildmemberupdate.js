const { EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/logsDB.json");

module.exports = {
    name: "guildMemberUpdate",
    async execute(oldMember, newMember) {

        // الرتب اللي انضافت
        const addedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));

        // الرتب اللي انحذفت
        const removedRoles = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));

        // ============================
        // 🎁 إعطاء رتبة (Role Give)
        // ============================

        if (addedRoles.size > 0) {

            const channelID = await db.get(`log_rolegive_${newMember.guild.id}`);
            if (channelID) {

                const logChannel = newMember.guild.channels.cache.get(channelID);
                if (logChannel) {

                    addedRoles.forEach(role => {

                        const embed = new EmbedBuilder()
                            .setTitle("🎁 تم إعطاء رتبة")
                            .addFields(
                                { name: "👤 الشخص", value: `${newMember}`, inline: true },
                                { name: "📛 الرتبة", value: `${role}`, inline: true }
                            )
                            .setColor("#33ccff")
                            .setTimestamp();

                        logChannel.send({ embeds: [embed] });
                    });
                }
            }
        }

        // ============================
        // 📤 إزالة رتبة (Role Remove)
        // ============================

        if (removedRoles.size > 0) {

            const channelID = await db.get(`log_roleremove_${newMember.guild.id}`);
            if (channelID) {

                const logChannel = newMember.guild.channels.cache.get(channelID);
                if (logChannel) {

                    removedRoles.forEach(role => {

                        const embed = new EmbedBuilder()
                            .setTitle("📤 تم إزالة رتبة")
                            .addFields(
                                { name: "👤 الشخص", value: `${newMember}`, inline: true },
                                { name: "📛 الرتبة", value: `${role}`, inline: true }
                            )
                            .setColor("#ff6600")
                            .setTimestamp();

                        logChannel.send({ embeds: [embed] });
                    });
                }
            }
        }
    }
};
