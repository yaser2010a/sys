const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isJailer, jailMember } = require('../utils/jail');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jail')
    .setDescription('سجن عضو (يفقد كل رتبه ويحصل على رتبة السجين)')
    .addUserOption(o => o.setName('العضو').setDescription('العضو المراد سجنه').setRequired(true))
    .addStringOption(o => o.setName('السبب').setDescription('سبب السجن').setRequired(false)),

  async execute(interaction) {
    if (!isJailer(interaction.member)) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم أوامر السجن', ephemeral: true });
    }

    const member = interaction.options.getMember('العضو');
    const reason = interaction.options.getString('السبب');

    if (!member) return interaction.reply({ content: 'ما لقيت هذا العضو بالسيرفر', ephemeral: true });

    if (member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ content: 'ما تقدر تسجن عضو رتبته أعلى أو مساوية لك', ephemeral: true });
    }

    try {
      await jailMember({ guild: interaction.guild, member, moderator: interaction.user, reason });
      await interaction.reply(`تم سجن **${member.user.tag}** 🔒`);
    } catch (err) {
      const messages = {
        NOT_ENABLED: 'نظام السجن غير مفعّل. فعّله أول من الداشبورد أو أمر `/سجن_نظام تفعيل`',
        NO_ROLE: 'ما تم تحديد رتبة السجن بعد. حددها من `/سجن_رتبة` أو الداشبورد',
        ALREADY_JAILED: 'هذا العضو مسجون أصلاً',
      };
      await interaction.reply({ content: messages[err.message] || 'صار خطأ غير متوقع', ephemeral: true });
    }
  },
};
