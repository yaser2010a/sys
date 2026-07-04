const { SlashCommandBuilder } = require('discord.js');
const config = require('./config.js');
const db = require('./db');
const logger = require('./logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('سجن')
    .setDescription('سجن عضو في السيرفر')
    .addUserOption(option => option.setName('عضو').setDescription('العضو المراد سجنه').setRequired(true))
    .addIntegerOption(option => option.setName('مدة').setDescription('المدة بالدقائق'))
    .addStringOption(option => option.setName('سبب').setDescription('سبب السجن')),
  async execute(interaction) {
    // ضع منطق السجن الخاص بك هنا مع استخدام interaction بدلاً من message
    await interaction.reply({ content: 'تم تنفيذ أمر السجن بنجاح.' });
  },
};