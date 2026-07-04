const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/logsDB.json");

module.exports = {

    permissions: { mode: "owner" },

    data: new SlashCommandBuilder()
        .setName('logs-info')
        .setDescription('عرض معلومات نظام اللوق في السيرفر'),

    async execute(interaction) {

        await interaction.deferReply();

        const guildId = interaction.guild.id;

        // قراءة كل اللوقات من قاعدة البيانات
        const logs = {
            messagedelete: await db.get(`log_messagedelete_${guildId}`),
            messageupdate: await db.get(`log_messageupdate_${guildId}`),

            rolecreate: await db.get(`log_rolecreate_${guildId}`),
            roledelete: await db.get(`log_roledelete_${guildId}`),
            rolegive: await db.get(`log_rolegive_${guildId}`),
            roleremove: await db.get(`log_roleremove_${guildId}`),

            channelcreate: await db.get(`log_channelcreate_${guildId}`),
            channeldelete: await db.get(`log_channeldelete_${guildId}`),

            botadd: await db.get(`log_botadd_${guildId}`),

            banadd: await db.get(`log_banadd_${guildId}`),
            bandelete: await db.get(`log_bandelete_${guildId}`),
            kickadd: await db.get(`log_kickadd_${guildId}`)
        };

        // دالة صغيرة لترتيب عرض الروم
        const show = (id) => id ? `<#${id}>` : "```غير محددة```";

        const embed = new EmbedBuilder()
            .setAuthor({
                name: interaction.guild.name,
                iconURL: interaction.guild.iconURL({ dynamic: true })
            })
            .setTitle("📑 معلومات نظام اللوق")
            .setColor("#5865F2")
            .setTimestamp()
            .setFooter({
                text: `Requested by: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })

            // قسم الرسائل
            .addFields(
                { name: "📩 حذف رسالة", value: show(logs.messagedelete), inline: true },
                { name: "✏️ تعديل رسالة", value: show(logs.messageupdate), inline: true }
            )

            // قسم الرتب
            .addFields(
                { name: "\u200B", value: "\u200B" }, // فاصل جميل
                { name: "🎉 إنشاء رتبة", value: show(logs.rolecreate), inline: true },
                { name: "❌ حذف رتبة", value: show(logs.roledelete), inline: true },
                { name: "🎁 إعطاء رتبة", value: show(logs.rolegive), inline: true },
                { name: "📤 إزالة رتبة", value: show(logs.roleremove), inline: true }
            )

            // قسم الرومات
            .addFields(
                { name: "\u200B", value: "\u200B" },
                { name: "📁 إنشاء قناة", value: show(logs.channelcreate), inline: true },
                { name: "🗂️ حذف قناة", value: show(logs.channeldelete), inline: true }
            )

            // قسم البوتات
            .addFields(
                { name: "\u200B", value: "\u200B" },
                { name: "🤖 دخول بوت", value: show(logs.botadd), inline: true }
            )

            // قسم الباند والطرد
            .addFields(
                { name: "\u200B", value: "\u200B" },
                { name: "🔨 إعطاء بان", value: show(logs.banadd), inline: true },
                { name: "⚖️ فك بان", value: show(logs.bandelete), inline: true },
                { name: "👢 طرد عضو", value: show(logs.kickadd), inline: true }
            );

        await interaction.editReply({ embeds: [embed] });
    }
};
