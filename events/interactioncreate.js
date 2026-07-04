const { EmbedBuilder, ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require("discord.js");
const fs = require("fs");
const config = require("../config.js");
const { Database } = require("st.db");
const protectDB = new Database("/Json-db/protectDB.json");
const applyDB = new Database("/Json-db/Bots/applyDB.json");

// ===== دالة مساعدة: أزرار التقديم معطلة =====
function getDisabledButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`apply_accept`).setLabel(`قبول`).setEmoji('☑️').setStyle(ButtonStyle.Success).setDisabled(true),
        new ButtonBuilder().setCustomId(`apply_reject`).setLabel(`رفض`).setEmoji('✖️').setStyle(ButtonStyle.Danger).setDisabled(true),
        new ButtonBuilder().setCustomId(`apply_reject_with_reason`).setLabel(`رفض مع سبب`).setEmoji('💡').setStyle(ButtonStyle.Danger).setDisabled(true)
    );
}

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {

        // ============================================================
        // Slash Commands
        // ============================================================
        if (interaction.isChatInputCommand()) {
            if (interaction.user.bot) return;
            const command = interaction.client.one4allSlashCommands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (error) {
                console.log("🔴 | error in one4all bot", error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: `لقد حدث خطأ اتصل بالمطورين`, ephemeral: true });
                }
            }
            return;
        }

        if (interaction.replied || interaction.deferred) return;

        // ============================================================
        // زر التقديم — يفتح مودال
        // ============================================================
        if (interaction.isButton() && interaction.customId === "apply_button") {
            const settings = applyDB.get(`apply_settings_${interaction.guild.id}`);
            const findApply = applyDB.get(`apply_${interaction.guild.id}`);
            if (!settings || !findApply) return interaction.reply({ content: `**النظام غير مفعل.**`, ephemeral: true });
            if (interaction.member.roles.cache.has(findApply.roleid)) return interaction.reply({ content: `**لديك الرتبة بالفعل.**`, ephemeral: true });

            const modal = new ModalBuilder().setCustomId("modal_apply").setTitle(`التقديم على رتبة`);
            const questions = [findApply.ask1, findApply.ask2, findApply.ask3, findApply.ask4, findApply.ask5];
            questions.forEach((q, i) => {
                if (q) modal.addComponents(new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId(`ask_${i + 1}`).setLabel(q.length > 45 ? q.slice(0, 42) + "..." : q).setStyle(TextInputStyle.Paragraph).setRequired(i === 0)
                ));
            });
            return await interaction.showModal(modal);
        }

        // ============================================================
        // مودال التقديم — إرسال الأجوبة لروم التقديمات
        // ============================================================
        if (interaction.isModalSubmit() && interaction.customId === "modal_apply") {
            const questions = applyDB.get(`apply_${interaction.guild.id}`);
            const settings = applyDB.get(`apply_settings_${interaction.guild.id}`);
            if (!settings || !settings.appliesroom) return interaction.reply({ content: "**خطأ: لم يتم إعداد رومات التقديم.**", ephemeral: true });
            const appliesroomsend = interaction.guild.channels.cache.get(settings.appliesroom);
            if (!appliesroomsend) return interaction.reply({ content: "**خطأ: لم يتم العثور على روم التقديمات.**", ephemeral: true });

            const embedsend = new EmbedBuilder()
                .setTitle(interaction.user.id)
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
                .setColor('Random')
                .setTimestamp();

            for (let i = 1; i <= 5; i++) {
                const question = questions[`ask${i}`];
                if (question) {
                    const answer = interaction.fields.getTextInputValue(`ask_${i}`);
                    embedsend.addFields({ name: `**${question}**`, value: `\`\`\`${answer || "لا يوجد إجابة"}\`\`\``, inline: false });
                }
            }
            embedsend.addFields(
                { name: `**انضم للديسكورد منذ :**`, value: `> <t:${Math.floor(interaction.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: `**انضم للسيرفر منذ :**`, value: `> <t:${Math.floor(interaction.member.joinedTimestamp / 1000)}:R>`, inline: true }
            );

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`apply_accept`).setLabel(`قبول`).setEmoji('☑️').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`apply_reject`).setLabel(`رفض`).setEmoji('✖️').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId(`apply_reject_with_reason`).setLabel(`رفض مع سبب`).setEmoji('💡').setStyle(ButtonStyle.Danger)
            );

            await interaction.reply({ content: `**تم إرسال تقديمك بنجاح**`, ephemeral: true });
            return await appliesroomsend.send({ embeds: [embedsend], components: [row] });
        }

        // ============================================================
        // أزرار الإدارة — قبول / رفض / رفض مع سبب
        // ============================================================
        if (interaction.isButton() && ["apply_accept", "apply_reject", "apply_reject_with_reason"].includes(interaction.customId)) {
            const settings = applyDB.get(`apply_settings_${interaction.guild.id}`);
            if (!settings) return interaction.reply({ content: `**النظام غير مفعل.**`, ephemeral: true });
            if (!interaction.member.roles.cache.has(settings.adminrole) && interaction.user.id !== interaction.guild.ownerId) return interaction.reply({ content: `**لا تمتلك الصلاحية لفعل هذا**`, ephemeral: true });

            if (interaction.customId === "apply_reject_with_reason") {
                const modal = new ModalBuilder().setCustomId("modal_reject_reason").setTitle(`رفض مع سبب`);
                modal.addComponents(new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("reason").setLabel("السبب").setStyle(TextInputStyle.Paragraph).setRequired(true)
                ));
                return await interaction.showModal(modal);
            }

            const embed = interaction.message?.embeds[0];
            const userId = embed?.title;
            const user = interaction.guild.members.cache.get(userId);
            if (!user) return interaction.reply({ content: `**❌ لم يتم العثور على المستخدم.**`, ephemeral: true });

            if (interaction.customId === "apply_accept") {
                const findApply = applyDB.get(`apply_${interaction.guild.id}`);
                const role = interaction.guild.roles.cache.get(findApply?.roleid);
                if (!role) return interaction.reply({ content: `**❌ الرتبة غير موجودة.**`, ephemeral: true });
                try {
                    await user.roles.add(role);
                    if (applyDB.get(`dm_${interaction.guild.id}`)) {
                        user.send({ embeds: [new EmbedBuilder().setTitle('تم قبول تقديمك 🎊').setDescription(`**> الاداري : ${interaction.user}**`).setColor('Green')] }).catch(() => {});
                    }
                    const resRoom = interaction.guild.channels.cache.get(settings.resultsroom);
                    if (resRoom) resRoom.send({ content: `${user}`, embeds: [new EmbedBuilder().setTitle("تم قبول التقديم").setColor('Green').setDescription(`صاحب التقديم: ${user}\nالإداري: ${interaction.user}`)] });
                    await interaction.reply({ content: `**✅ تم قبول التقديم بنجاح**`, ephemeral: true });
                    await interaction.message.edit({ components: [getDisabledButtons()] });
                } catch (e) {
                    interaction.reply({ content: `**❌ فشل في إعطاء الرتبة، تأكد من ترتيب رتب البوت!**`, ephemeral: true });
                }
            }

            if (interaction.customId === "apply_reject") {
                const resRoom = interaction.guild.channels.cache.get(settings.resultsroom);
                if (resRoom) resRoom.send({ embeds: [new EmbedBuilder().setTitle("تم رفض التقديم").setColor('Red').setDescription(`صاحب التقديم: ${user}\nالإداري: ${interaction.user}\nالسبب: لا يوجد سبب`)] });
                if (applyDB.get(`dm_${interaction.guild.id}`)) {
                    user.send({ embeds: [new EmbedBuilder().setTitle('تم رفض تقديمك 😥').setDescription(`**السبب:** لا يوجد سبب`).setColor('Red')] }).catch(() => {});
                }
                await interaction.reply({ content: `**✅ تم رفض التقديم بنجاح**`, ephemeral: true });
                await interaction.message.edit({ components: [getDisabledButtons()] });
            }
            return;
        }

        // ============================================================
        // مودال الرفض مع سبب
        // ============================================================
        if (interaction.isModalSubmit() && interaction.customId === "modal_reject_reason") {
            const settings = applyDB.get(`apply_settings_${interaction.guild.id}`);
            if (!settings) return interaction.reply({ content: `**النظام غير مفعل.**`, ephemeral: true });

            const reason = interaction.fields.getTextInputValue('reason');
            const embed = interaction.message?.embeds[0];
            const userId = embed?.title;
            const user = interaction.guild.members.cache.get(userId);
            if (!user) return interaction.reply({ content: `**❌ لم يتم العثور على المستخدم.**`, ephemeral: true });

            const resRoom = interaction.guild.channels.cache.get(settings.resultsroom);
            if (resRoom) resRoom.send({ embeds: [new EmbedBuilder().setTitle("تم رفض التقديم").setColor('Red').setDescription(`صاحب التقديم: ${user}\nالإداري: ${interaction.user}\nالسبب: ${reason}`)] });
            if (applyDB.get(`dm_${interaction.guild.id}`)) {
                user.send({ embeds: [new EmbedBuilder().setTitle('تم رفض تقديمك 😥').setDescription(`**السبب:** ${reason}`).setColor('Red')] }).catch(() => {});
            }
            await interaction.reply({ content: `**✅ تم رفض التقديم بسبب: ${reason}**`, ephemeral: true });
            await interaction.message.edit({ components: [getDisabledButtons()] });
            return;
        }

        // ============================================================
        // أزرار بانل الحماية
        // ============================================================
        if (interaction.isButton() && interaction.customId.startsWith("protect_")) {
            if (interaction.user.id !== interaction.guild.ownerId) {
                return interaction.reply({ content: "❌ هذه الأزرار مخصصة للأونر فقط.", ephemeral: true });
            }

            let data = protectDB.get("settings") || {
                enabled: false, trapChannel: null,
                dmMessage: "تم حظرك من سيرفر {server} بسبب إرسال رسالة مشبوهة.\n\nحسابك على الأرجح مخترق، يُنصح بـ:\n• تغيير كلمة المرور فوراً\n• تنظيف الأجهزة المرتبطة بالحساب\n• مراجعة الجلسات النشطة وإزالة غير المعروفة\n\nللتواصل لفك الحظر: 768a_",
                serverName: "nuv", logs: []
            };

            if (interaction.customId === "protect_enable") { data.enabled = true; protectDB.set("settings", data); return interaction.reply({ content: "🟢 تم تفعيل النظام.", ephemeral: true }); }
            if (interaction.customId === "protect_disable") { data.enabled = false; protectDB.set("settings", data); return interaction.reply({ content: "🔴 تم إيقاف النظام.", ephemeral: true }); }
            if (interaction.customId === "protect_setchannel") { protectDB.set("awaiting", { type: "trapChannel", user: interaction.user.id }); return interaction.reply({ content: "📌 أرسل الآن **ID** قناة الفخ في الشات.", ephemeral: true }); }
            if (interaction.customId === "protect_setdm") { protectDB.set("awaiting", { type: "dmMessage", user: interaction.user.id }); return interaction.reply({ content: "✉️ أرسل الآن رسالة الـ DM الجديدة.\n\nاستخدم `{server}` لعرض اسم السيرفر.", ephemeral: true }); }
            if (interaction.customId === "protect_setservername") { protectDB.set("awaiting", { type: "serverName", user: interaction.user.id }); return interaction.reply({ content: "🏷️ أرسل الآن اسم السيرفر في الشات.", ephemeral: true }); }
            if (interaction.customId === "protect_unban") { protectDB.set("awaiting", { type: "unban", user: interaction.user.id }); return interaction.reply({ content: "🔓 أرسل الآن **ID** الشخص الذي تريد فك الباند عنه.", ephemeral: true }); }
            if (interaction.customId === "protect_reset") {
                protectDB.set("settings", { enabled: false, trapChannel: null, dmMessage: "تم حظرك من سيرفر {server} بسبب إرسال رسالة مشبوهة.\n\nحسابك على الأرجح مخترق، يُنصح بـ:\n• تغيير كلمة المرور فوراً\n• تنظيف الأجهزة المرتبطة بالحساب\n• مراجعة الجلسات النشطة وإزالة غير المعروفة\n\nللتواصل لفك الحظر: 768a_", serverName: "nuv", logs: [] });
                return interaction.reply({ content: "♻ تم إعادة ضبط النظام.", ephemeral: true });
            }
            if (interaction.customId === "protect_showlogs") {
                if (data.logs.length === 0) return interaction.reply({ content: "📭 لا توجد حالات مسجلة.", ephemeral: true });
                const last10 = data.logs.slice(-10).reverse().map((log, i) =>
                    `**${i + 1}.** <@${log.user}> — <t:${Math.floor(log.time / 1000)}:R>\n**الرسالة:** \`${log.content?.slice(0, 80) || 'بدون محتوى'}\``
                ).join("\n\n");
                return interaction.reply({ embeds: [new EmbedBuilder().setTitle("📋 آخر 10 حالات").setDescription(last10).setColor(0x2b2d31)], ephemeral: true });
            }
        }

        // ============================================================
        // بانل القوانين
        // ============================================================
        if (interaction.isStringSelectMenu() && interaction.customId === "rules_panel") {
            const selected = interaction.values[0];
            if (selected === "server_rules") {
                const rules = fs.readFileSync("./data/file1.txt", "utf8");
                return interaction.reply({ embeds: [new EmbedBuilder().setTitle("📜 قوانين السيرفر").setDescription(rules).setColor("#2b2d31").setTimestamp()], ephemeral: true });
            }
            if (selected === "admin_rules") {
                const rules = fs.readFileSync("./data/file2.txt", "utf8");
                return interaction.reply({ embeds: [new EmbedBuilder().setTitle("⚙️ قوانين الإدارة").setDescription(rules).setColor("#2b2d31").setTimestamp()], ephemeral: true });
            }
        }

        // ============================================================
        // نظام الرتب
        // ============================================================
        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId !== 'roles_menu') return;

        const selected = interaction.values[0];

        if (selected === 'react_roles') {
            await interaction.deferReply({ ephemeral: true });
            let text = `⚡ **الرتب التفاعلية – Vure**\n\n`;
            for (const r of config.reactRoles) {
                text += `**${r.name}**\n<@&${r.id}>\n• تحتاج: لفل ${r.text} كتابي + لفل ${r.voice} صوتي\n• الصلاحيات: ${r.perms}\n\n`;
            }
            return interaction.editReply({ embeds: [{ title: '⚡ الرتب التفاعلية', description: text, color: 0x2b2d31 }] });
        }

        if (selected === 'special_roles') {
            await interaction.deferReply({ ephemeral: true });
            return interaction.editReply({ embeds: [{ title: '🔥 الرتب الخاصة', description: `للحصول على رتبة خاصة يجب:\n• عمل **بوست للسيرفر**\n• ثم فتح تكت هنا: <#${config.tickets.specialRolesTicket}>\n\nبعد فتح التكت:\n• يتم التحقق من البوست\n• ثم يتم تسليم الرتبة الخاصة`, color: 0x2b2d31 }] });
        }

        if (selected === 'buy_roles') {
            await interaction.deferReply({ ephemeral: true });
            let list = config.buyRoles.map(r => `**${r.name}**\n<@&${r.id}>\nالسعر: \`${r.price.toLocaleString()}\` كريدت`).join('\n\n');
            return interaction.editReply({ embeds: [{ title: '💰 الرتب الشرائية', description: `${list}\n\n👤 **حوّل المبلغ إلى:** <@${config.owner}>\n🎫 **افتح تكت هنا:** <#${config.tickets.specialRolesTicket}>\n\n📸 **أرسل صورة التحويل داخل التكت**`, color: 0x2b2d31 }] });
        }
    }
};