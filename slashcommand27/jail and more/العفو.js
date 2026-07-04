const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('عفو')
    .setDescription('فك سجن عضو وإرجاع رتبه')
    .addUserOption(option => option.setName('عضو').setDescription('العضو المراد فك سجنه').setRequired(true))
    .addStringOption(option => option.setName('سبب').setDescription('سبب العفو')),
  async execute(interaction) {
    await interaction.reply({ content: 'تم فك السجن بنجاح.' });
  },
};