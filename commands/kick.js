const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { kickMember } = require('../utils/moderation');
const { hasCommandAccess } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('طرد عضو من السيرفر')
    .addUserOption(o => o.setName('العضو').setDescription('العضو المراد طرده').setRequired(true))
    .addStringOption(o => o.setName('السبب').setDescription('سبب الطرد').setRequired(false)),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'كيك', m => m.permissions.has(PermissionFlagsBits.KickMembers))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const target = interaction.options.getUser('العضو');
    const reason = interaction.options.getString('السبب');

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: 'ما لقيت هذا العضو بالسيرفر', ephemeral: true });
    if (!member.kickable) {
      return interaction.reply({ content: 'ما أقدر أطرد هذا العضو (صلاحياته أعلى أو مساوية لي)', ephemeral: true });
    }

    await kickMember({ guild: interaction.guild, target: member, moderator: interaction.user, reason });
    await interaction.reply(`تم طرد **${target.tag}** ✅`);
  },
};
