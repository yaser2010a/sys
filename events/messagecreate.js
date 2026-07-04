const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Database } = require("st.db");
const protectDB = new Database("/Json-db/protectDB.json");
const afkDB = new Database("/Json-db/Bots/afkDB.json");

module.exports = {
    name: "messageCreate",
    async execute(message) {

        if (message.author.bot) return;

        // ============================================================
        // نظام AFK — إلغاء عند إرسال رسالة
        // ============================================================
        const afkData = afkDB.get(`afk_${message.author.id}`);
        if (afkData && afkData.since) {
            afkDB.delete(`afk_${message.author.id}`);

            let mentionsList = "";
            if (afkData.mentions && afkData.mentions.length > 0) {
                mentionsList = afkData.mentions.slice(-10).map((m, i) =>
                    `**${i + 1}.** <@${m.userId}> — <t:${Math.floor(m.time / 1000)}:R>`
                ).join("\n");
            } else {
                mentionsList = "لا يوجد منشنات";
            }

            const cancelEmbed = new EmbedBuilder()
                .setColor("#00ff99")
                .setTitle("✅ تم إلغاء وضع AFK")
                .setDescription(`مرحباً <@${message.author.id}>، تم إلغاء AFK تلقائياً.\n**السبب كان:** ${afkData.reason}`)
                .addFields({ name: `📬 المنشنات أثناء غيابك (${afkData.mentions?.length || 0})`, value: mentionsList })
                .setTimestamp();

            const rows = [];
            if (afkData.mentions && afkData.mentions.length > 0) {
                const last5 = afkData.mentions.slice(-5);
                const buttonsRow = new ActionRowBuilder().addComponents(
                    last5.map((m, i) =>
                        new ButtonBuilder()
                            .setLabel(`منشن ${i + 1}`)
                            .setStyle(ButtonStyle.Link)
                            .setURL(m.messageUrl)
                    )
                );
                rows.push(buttonsRow);
            }

            const msg = await message.channel.send({ embeds: [cancelEmbed], components: rows });
            setTimeout(() => msg.delete().catch(() => {}), 15000);
        }

        // ============================================================
        // نظام AFK — إبلاغ عند منشن شخص AFK
        // ============================================================
        for (const mentionedUser of message.mentions.users.values()) {
            if (mentionedUser.id === message.author.id) continue;
            const mentionedAfk = afkDB.get(`afk_${mentionedUser.id}`);
            if (!mentionedAfk) continue;

            mentionedAfk.mentions = mentionedAfk.mentions || [];
            mentionedAfk.mentions.push({
                userId: message.author.id,
                messageUrl: message.url,
                content: message.content.slice(0, 100),
                time: Date.now()
            });
            afkDB.set(`afk_${mentionedUser.id}`, mentionedAfk);

            const mentionEmbed = new EmbedBuilder()
                .setColor("#ff9900")
                .setTitle("💤 هذا الشخص في وضع AFK")
                .setDescription(`<@${mentionedUser.id}> غائب حالياً.\n**السبب:** ${mentionedAfk.reason}`)
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel("الذهاب إلى رسالتك")
                    .setStyle(ButtonStyle.Link)
                    .setURL(message.url)
            );

            await message.channel.send({ embeds: [mentionEmbed], components: [row] });
        }

        // ============================================================
        // استقبال الإدخال من البانل
        // ============================================================
        const awaiting = protectDB.get("awaiting");
        if (awaiting && awaiting.user === message.author.id) {

            let data = protectDB.get("settings");

            if (awaiting.type === "trapChannel") {
                if (isNaN(message.content))
                    return message.reply("❌ ID غير صالح.");
                data.trapChannel = message.content;
                protectDB.set("settings", data);
                protectDB.delete("awaiting");
                return message.reply("✅ تم حفظ قناة الفخ بنجاح.");
            }

            if (awaiting.type === "dmMessage") {
                data.dmMessage = message.content;
                protectDB.set("settings", data);
                protectDB.delete("awaiting");
                return message.reply("✉️ تم تحديث رسالة الـ DM بنجاح.");
            }

            if (awaiting.type === "serverName") {
                data.serverName = message.content;
                protectDB.set("settings", data);
                protectDB.delete("awaiting");
                return message.reply("🏷️ تم تحديث اسم السيرفر داخل الرسالة.");
            }

            if (awaiting.type === "unban") {
                try {
                    await message.guild.members.unban(message.content);
                } catch {
                    return message.reply("❌ ID غير صالح أو الشخص غير مبند.");
                }
                protectDB.delete("awaiting");
                return message.reply("🔓 تم فك الباند بنجاح.");
            }
        }

        // ============================================================
        // نظام الفخ (Anti-Scam)
        // ============================================================
        const data = protectDB.get("settings");
        if (!data || !data.enabled) return;
        if (!data.trapChannel) return;
        if (message.channel.id !== data.trapChannel) return;

        message.delete().catch(() => {});

        try {
            await message.author.send(
                data.dmMessage.replace("{server}", data.serverName)
            );
        } catch (err) {
            console.log("⚠️ لم يتمكن البوت من إرسال DM");
        }

        setTimeout(async () => {
            try {
                await message.member.ban({ reason: "Anti-Scam Trap" });
            } catch (err) {
                console.log("❌ فشل الباند:", err);
            }

            data.logs.push({
                user: message.author.id,
                time: Date.now(),
                content: message.content
            });
            protectDB.set("settings", data);
        }, 40000);
    }
};