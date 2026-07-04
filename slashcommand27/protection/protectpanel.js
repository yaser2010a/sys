const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const { Database } = require("st.db");
const protectDB = new Database("./Json-db/Bots/protectDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("protectpanel")
        .setDescription("لوحة التحكم بنظام مكافحة رسائل النصب (للأونر فقط)"),

    async execute(interaction) {

        if (interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({
                content: "❌ هذا الأمر مخصص للأونر فقط.",
                ephemeral: true
            });
        }

        const data = protectDB.get("settings") || {
            enabled: false,
            trapChannel: null,
            dmMessage: "تم حظرك من سيرفر {server} بسبب إرسال رسالة مشبوهة.\n\nحسابك على الأرجح مخترق، يُنصح بـ:\n• تغيير كلمة المرور فوراً\n• تنظيف الأجهزة المرتبطة بالحساب\n• مراجعة الجلسات النشطة وإزالة غير المعروفة\n\nللتواصل لفك الحظر: 768a_",
            serverName: "nuv",
            logs: []
        };

        const embed = new EmbedBuilder()
            .setTitle("🛡 نظام مكافحة رسائل النصب")
            .setColor(0x2b2d31)
            .addFields(
                { name: "الحالة", value: data.enabled ? "🟢 مفعل" : "🔴 موقوف" },
                { name: "قناة الفخ", value: String(data.trapChannel || "غير محددة") },
                { name: "اسم السيرفر في الرسالة", value: String(data.serverName || "غير محدد") },
                { name: "عدد الحالات المسجلة", value: String((data.logs || []).length) }
            );

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("protect_enable")
                .setLabel("تفعيل")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("protect_disable")
                .setLabel("إيقاف")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId("protect_setchannel")
                .setLabel("تحديد قناة الفخ")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("protect_reset")
                .setLabel("إعادة ضبط")
                .setStyle(ButtonStyle.Secondary)
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("protect_showlogs")
                .setLabel("عرض آخر 10 حالات")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("protect_setdm")
                .setLabel("تغيير رسالة الـ DM")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("protect_setservername")
                .setLabel("تغيير اسم السيرفر")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("protect_unban")
                .setLabel("فك باند")
                .setStyle(ButtonStyle.Success)
        );

        await interaction.reply({ embeds: [embed], components: [row1, row2] });
    }
};