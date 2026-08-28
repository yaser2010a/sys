const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { buildTrapPanelEmbed, buildTrapPanelButtons } = require('../utils/trapSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trap-panel')
    .setDescription('نشر لوحة تحكم نظام مكافحة رسائل النصب بهذي القناة')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const embed = buildTrapPanelEmbed(interaction.guild);
    const components = buildTrapPanelButtons();
    await interaction.channel.send({ embeds: [embed], components });
    await interaction.reply({ content: 'تم نشر لوحة نظام الفخ ✅', ephemeral: true });
  },
};
// مو موجود بداشبورد البوت