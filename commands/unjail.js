const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isJailer, unjailMember, isCurrentlyJailed } = require('../utils/jail');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unjail')
    .setDescription('فك سجن عضو وإرجاع رتبه السابقة')
    .addUserOption(o => o.setName('العضو').setDescription('العضو المراد فك سجنه').setRequired(true))
    .addStringOption(o => o.setName('السبب').setDescription('السبب').setRequired(false)),

  async execute(interaction) {
    if (!isJailer(interaction.member)) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم أوامر السجن', ephemeral: true });
    }

    const member = interaction.options.getMember('العضو');
    const reason = interaction.options.getString('السبب');

    if (!member) return interaction.reply({ content: 'ما لقيت هذا العضو بالسيرفر', ephemeral: true });
    if (!isCurrentlyJailed(interaction.guild.id, member.id)) {
      return interaction.reply({ content: 'هذا العضو مو مسجون', ephemeral: true });
    }

    try {
      await unjailMember({ guild: interaction.guild, member, moderator: interaction.user, reason, restorePreviousRoles: true });
      await interaction.reply(`تم فك سجن **${member.user.tag}** وإرجاع رتبه السابقة 🔓`);
    } catch (err) {
      await interaction.reply({ content: 'صار خطأ، تأكد إن رتبة السجن محددة', ephemeral: true });
    }
  },
};
