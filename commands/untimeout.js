const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { unmuteMember } = require('../utils/moderation');
const { hasCommandAccess } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('إلغاء كتم عضو')
    .addUserOption(o => o.setName('العضو').setDescription('العضو المراد إلغاء كتمه').setRequired(true)),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'انميوت', m => m.permissions.has(PermissionFlagsBits.ModerateMembers))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const target = interaction.options.getMember('العضو');
    if (!target.isCommunicationDisabled()) {
      return interaction.reply({ content: 'هذا العضو مو مكتوم أصلاً', ephemeral: true });
    }
    await unmuteMember({ guild: interaction.guild, target, moderator: interaction.user });
    await interaction.reply(`تم إلغاء كتم **${target.user.tag}** ✅`);
  },
};
