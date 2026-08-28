const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { hasCommandAccess } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('بناء وإرسال ايمبد مخصص')
    .addChannelOption(o => o.setName('القناة').setDescription('القناة (اختياري، الافتراضي هذي القناة)').setRequired(false)),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'ايمبد', m => m.permissions.has(PermissionFlagsBits.ManageMessages))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const channel = interaction.options.getChannel('القناة') || interaction.channel;

    const modal = new ModalBuilder()
      .setCustomId(`embed_modal_${channel.id}`)
      .setTitle('بناء الايمبد');

    const title = new TextInputBuilder().setCustomId('title').setLabel('العنوان').setStyle(TextInputStyle.Short).setRequired(false);
    const description = new TextInputBuilder().setCustomId('description').setLabel('الوصف').setStyle(TextInputStyle.Paragraph).setRequired(true);
    const color = new TextInputBuilder().setCustomId('color').setLabel('اللون (هيكس مثل #5865F2)').setStyle(TextInputStyle.Short).setRequired(false);
    const image = new TextInputBuilder().setCustomId('image').setLabel('رابط صورة (اختياري)').setStyle(TextInputStyle.Short).setRequired(false);
    const footer = new TextInputBuilder().setCustomId('footer').setLabel('نص الفوتر (اختياري)').setStyle(TextInputStyle.Short).setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(title),
      new ActionRowBuilder().addComponents(description),
      new ActionRowBuilder().addComponents(color),
      new ActionRowBuilder().addComponents(image),
      new ActionRowBuilder().addComponents(footer)
    );

    await interaction.showModal(modal);
  },
};
