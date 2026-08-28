const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { unbanMember } = require('../utils/moderation');
const { hasCommandAccess } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('إلغاء حظر عضو')
    .addStringOption(o => o.setName('الايدي').setDescription('آيدي العضو').setRequired(true))
    .addStringOption(o => o.setName('السبب').setDescription('سبب إلغاء الحظر').setRequired(false)),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'انبان', m => m.permissions.has(PermissionFlagsBits.BanMembers))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const targetId = interaction.options.getString('الايدي');
    const reason = interaction.options.getString('السبب');

    const bans = await interaction.guild.bans.fetch();
    if (!bans.has(targetId)) {
      return interaction.reply({ content: 'هذا العضو مو محظور أصلاً', ephemeral: true });
    }

    await unbanMember({ guild: interaction.guild, targetId, moderator: interaction.user, reason });
    await interaction.reply(`تم إلغاء حظر العضو صاحب الآيدي \`${targetId}\` ✅`);
  },
};
