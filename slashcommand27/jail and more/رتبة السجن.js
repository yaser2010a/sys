// استخدم هذا الهيكل لكلا الملفين
const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('سجان') // أو 'رتبه-السجن' للملف الآخر
    .setDescription('تحديد رتبة السجانين')
    .addRoleOption(option => option.setName('رتبة').setDescription('حدد الرتبة').setRequired(true)),
  async execute(interaction) {
    await interaction.reply({ content: 'تم تحديث الرتبة بنجاح.' });
  },
};