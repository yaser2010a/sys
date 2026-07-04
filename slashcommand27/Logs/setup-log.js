const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/logsDB.json");

module.exports = {

    permissions: { mode: "owner" },

    data: new SlashCommandBuilder()
        .setName('setup-logs')
        .setDescription('تسطيب نظام اللوق')
        .addChannelOption(o => o.setName('messagedelete').setDescription('روم لوق حذف الرسائل'))
        .addChannelOption(o => o.setName('messageupdate').setDescription('روم لوق تعديل الرسائل'))
        .addChannelOption(o => o.setName('rolecreate').setDescription('روم لوق إنشاء رتبة'))
        .addChannelOption(o => o.setName('roledelete').setDescription('روم لوق حذف رتبة'))
        .addChannelOption(o => o.setName('rolegive').setDescription('روم لوق إعطاء رتبة'))
        .addChannelOption(o => o.setName('roleremove').setDescription('روم لوق إزالة رتبة'))
        .addChannelOption(o => o.setName('channelcreate').setDescription('روم لوق إنشاء روم'))
        .addChannelOption(o => o.setName('channeldelete').setDescription('روم لوق حذف روم'))
        .addChannelOption(o => o.setName('botadd').setDescription('روم لوق دخول بوت'))
        .addChannelOption(o => o.setName('banadd').setDescription('روم لوق إعطاء بان'))
        .addChannelOption(o => o.setName('bandelete').setDescription('روم لوق فك بان'))
        .addChannelOption(o => o.setName('kickadd').setDescription('روم لوق طرد عضو'))
        .addChannelOption(o => o.setName('reactionremove').setDescription('روم لوق إزالة رياكشن')),

    async execute(interaction) {

        const logs = {
            messagedelete: "🗑️ لوق حذف الرسائل",
            messageupdate: "✏️ لوق تعديل الرسائل",
            rolecreate: "🎉 لوق إنشاء رتبة",
            roledelete: "❌ لوق حذف رتبة",
            rolegive: "🎁 لوق إعطاء رتبة",
            roleremove: "📤 لوق إزالة رتبة",
            channelcreate: "📁 لوق إنشاء روم",
            channeldelete: "🗂️ لوق حذف روم",
            botadd: "🤖 لوق دخول بوت",
            banadd: "🔨 لوق إعطاء بان",
            bandelete: "⚖️ لوق فك بان",
            kickadd: "👢 لوق طرد",
            reactionremove: "💔 لوق إزالة رياكشن"
        };

        let enabledLogs = [];

        for (const key in logs) {
            const channel = interaction.options.getChannel(key);

            if (channel) {
                await db.set(`log_${key}_${interaction.guild.id}`, channel.id);

                enabledLogs.push(`${logs[key]} → ${channel}`);

                // رسالة داخل الروم نفسه
                channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(logs[key])
                            .setDescription(`تم تفعيل هذا اللوق في:\n${channel}`)
                            .setColor("#2b2d31")
                            .setTimestamp()
                    ]
                });
            }
        }

        const replyEmbed = new EmbedBuilder()
            .setTitle("✅ تم تحديث إعدادات اللوق")
            .setDescription(
                enabledLogs.length > 0
                    ? enabledLogs.map(l => `• ${l}`).join("\n")
                    : "لم يتم اختيار أي لوق."
            )
            .setColor("#5865F2")
            .setTimestamp();

        return interaction.reply({ embeds: [replyEmbed], ephemeral: false });
    }
};
