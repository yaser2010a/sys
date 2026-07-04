const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");

// ==========================
// 1) مسار الانفايتس
// ==========================
const invitesPath = path.join(__dirname, "../Json-db/invites.json");

// قراءة JSON بدون كاش
function loadInvites() {
    try {
        delete require.cache[require.resolve(invitesPath)];
        return require(invitesPath);
    } catch {
        return {};
    }
}

// ==========================
// 2) قاعدة بيانات لوق البوتات
// ==========================
const logsDB = new Database("/Json-db/Bots/logsDB.json");

// ==========================
// 3) كاش الانفايتس
// ==========================
const invitesCache = new Map();

// ==========================
// 4) ID الرتبة التلقائية
// ==========================
const AUTO_ROLE_ID = "1464631837505622221";

module.exports = {
    name: "guildMemberAdd",
    async execute(member) {

        // ============================================================
        // القسم الأول: لوق دخول البوتات (نفس كودك بدون تغيير)
        // ============================================================
        if (member.user.bot) {

            const channelID = await logsDB.get(`log_botadd_${member.guild.id}`);
            if (channelID) {
                const logChannel = member.guild.channels.cache.get(channelID);
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle("🤖 دخول بوت جديد")
                        .addFields({ name: "👤 البوت", value: `${member.user}` })
                        .setColor("#00bcd4")
                        .setTimestamp();

                    logChannel.send({ embeds: [embed] });
                }
            }

            return; // البوتات ما لها انفايت ولا رتبة تلقائية
        }

        // ============================================================
        // القسم الثاني: الرتبة التلقائية (Auto Role)
        // ============================================================

        try {
            const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
            if (role) {
                await member.roles.add(role);
                console.log(`🎉 تم إعطاء الرتبة التلقائية لـ ${member.user.tag}`);
            } else {
                console.log("❌ AUTO ROLE غير موجودة");
            }
        } catch (err) {
            console.log("❌ فشل إعطاء الرتبة التلقائية:", err);
        }

        // ============================================================
        // القسم الثالث: نظام الانفايتس (نفس كودك)
        // ============================================================

        let invitesData = loadInvites();
        const guild = member.guild;

        const newInvites = await guild.invites.fetch();
        const oldInvites = invitesCache.get(guild.id) || new Map();

        const usedInvite = newInvites.find(inv => oldInvites.get(inv.code) < inv.uses);

        invitesCache.set(guild.id, new Map(newInvites.map(inv => [inv.code, inv.uses])));

        if (!usedInvite) return;

        const inviter = usedInvite.inviter;
        if (!inviter) return;

        if (!invitesData[inviter.id]) {
            invitesData[inviter.id] = { real: 0, fake: 0, total: 0, members: [] };
        }

        const accountAge = Date.now() - member.user.createdTimestamp;
        const oneMonth = 1000 * 60 * 60 * 24 * 30;

        if (accountAge < oneMonth) {
            invitesData[inviter.id].fake++;
        } else {
            invitesData[inviter.id].real++;
            invitesData[inviter.id].members.push(member.id);
        }

        invitesData[inviter.id].total =
            invitesData[inviter.id].real + invitesData[inviter.id].fake;

        fs.writeFileSync(invitesPath, JSON.stringify(invitesData, null, 2));
    }
};
