const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('ايقاف-النظام')
    .setDescription('تشغيل/إيقاف نظام السجن'),
  async execute(interaction) {
    await interaction.reply({ content: 'تم تغيير حالة النظام.' });
  },
};