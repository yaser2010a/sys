const { SlashCommandBuilder } = require('discord.js');
const { getGuildSettings } = require('../utils/database');
const { buildApplyModal } = require('../utils/applyModal');

module.exports = {
  data: new SlashCommandBuilder().setName('mod-apply').setDescription('تقديم على وظيفة إدارية بالسيرفر'),

  async execute(interaction) {
    const settings = getGuildSettings(interaction.guild.id);
    if (!settings.apply_channel) {
      return interaction.reply({ content: 'التقديم مو مفعّل بهذا السيرفر حالياً', ephemeral: true });
    }

    await interaction.showModal(buildApplyModal());
  },
};
