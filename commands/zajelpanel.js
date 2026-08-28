const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { hasCommandAccess } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('zajelpanel')
    .setDescription('Post the anonymous message (Zajel) panel in this channel'),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'zajelpanel', m => m.permissions.has(PermissionFlagsBits.ManageGuild))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🕊️ زاجل')
      .setDescription(
        'هذا النظام يتيح لك إرسال رسالة مجهولة لشخص تريد مصارحته بشيء دون أن يعرف هويتك.\n\nاضغط الزر وحط آيدي الشخص والرسالة.'
      )
      .setColor('#2b2d31');

    const button = new ButtonBuilder()
      .setCustomId('zajel_open')
      .setLabel('إرسال رسالة مجهولة')
      .setEmoji('🕊️')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: 'تم نشر لوحة الزاجل ✅', ephemeral: true });
  },
};
