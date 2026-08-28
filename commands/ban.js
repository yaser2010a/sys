const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { banMember } = require('../utils/moderation');
const { hasCommandAccess } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('حظر عضو من السيرفر')
    .addUserOption(o => o.setName('العضو').setDescription('العضو المراد حظره').setRequired(true))
    .addStringOption(o => o.setName('السبب').setDescription('سبب الحظر').setRequired(false)),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'بان', m => m.permissions.has(PermissionFlagsBits.BanMembers))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const target = interaction.options.getUser('العضو');
    const reason = interaction.options.getString('السبب');

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: 'ما تقدر تحظر نفسك 😅', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member && !member.bannable) {
      return interaction.reply({ content: 'ما أقدر أحظر هذا العضو (صلاحياته أعلى أو مساوية لي)', ephemeral: true });
    }

    await banMember({ guild: interaction.guild, target, moderator: interaction.user, reason });
    await interaction.reply(`تم حظر **${target.tag}** ✅`);
  },
};
