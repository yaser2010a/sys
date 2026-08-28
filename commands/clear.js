const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { hasCommandAccess } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('حذف عدد من الرسائل بهذي القناة'),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'مسح', m => m.permissions.has(PermissionFlagsBits.ManageMessages))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🗑️ حذف الرسائل')
      .setDescription('اختر عدد الرسائل المراد حذفها من القائمة بالأسفل')
      .setColor('#ED4245');

    const menu = new StringSelectMenuBuilder()
      .setCustomId('clear_select')
      .setPlaceholder('اختر عدد الرسائل')
      .addOptions(
        { label: '10 رسائل', value: '10' },
        { label: '50 رسالة', value: '50' },
        { label: '100 رسالة', value: '100' },
        { label: '200 رسالة', value: '200' }
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },
};