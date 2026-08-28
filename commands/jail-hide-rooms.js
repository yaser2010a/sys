const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { syncHideRooms } = require('../utils/jail');
const { getGuildSettings } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jail-hide-rooms')
    .setDescription('إعادة مزامنة إخفاء الرومات عن المسجونين (استخدمه بعد إنشاء رومات جديدة)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const settings = getGuildSettings(interaction.guild.id);
    if (!settings.jail_role) {
      return interaction.reply({ content: 'ما تم تحديد رتبة السجن بعد', ephemeral: true });
    }

    await interaction.deferReply();
    await syncHideRooms(interaction.guild);
    await interaction.editReply('تم تحديث إخفاء الرومات لكل القنوات ✅');
  },
};
