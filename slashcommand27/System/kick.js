const { 
    PermissionsBitField,
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

module.exports = {

    permissions: {
        mode: "role",
        roleId: "1464624903918457035"
    },

    ownersOnly: false,

    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('طرد عضو من السيرفر')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('العضو المراد طرده')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('سبب الطرد')
                .setRequired(false)
        ),

    async execute(interaction) {
        try {

            // 1) تحقق من صلاحية المستخدم
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
                return interaction.reply({ content: "❌ لا تمتلك صلاحية الطرد.", ephemeral: true });
            }

            // 2) جلب العضو بشكل صحيح
            const member = interaction.options.getMember('member');

            if (!member) {
                return interaction.reply({ content: "❌ لم أستطع العثور على هذا العضو داخل السيرفر.", ephemeral: true });
            }

            // 3) منع طرد أعضاء أعلى من البوت
            if (!member.kickable) {
                return interaction.reply({ content: "❌ لا أستطيع طرد هذا العضو (رتبته أعلى من البوت).", ephemeral: true });
            }

            // 4) تجهيز السبب
            const reason = interaction.options.getString('reason') || "بدون سبب";
            const finalReason = `${reason} | By: ${interaction.user.tag}`;

            // 5) تنفيذ الطرد
            await member.kick(finalReason);

            // 6) الرد
            return interaction.reply({
                content: `✅ تم طرد **${member.user.tag}** بنجاح.\n**السبب:** ${reason}`
            });

        } catch (err) {
            console.log(err);
            return interaction.reply({ content: "⚠️ حدث خطأ غير متوقع.", ephemeral: true });
        }
    }
};
