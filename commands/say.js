const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { hasCommandAccess } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('يخلي البوت يقول أي شي')
    .addStringOption(o => o.setName('النص').setDescription('النص المراد إرساله').setRequired(true))
    .addChannelOption(o => o.setName('القناة').setDescription('القناة (اختياري، الافتراضي هذي القناة)').setRequired(false)),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'قول', m => m.permissions.has(PermissionFlagsBits.ManageMessages))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const text = interaction.options.getString('النص');
    const channel = interaction.options.getChannel('القناة') || interaction.channel;

    await channel.send(text);
    await interaction.reply({ content: 'تم الإرسال ✅', ephemeral: true });
  },
};
