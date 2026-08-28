const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendDmToMembers } = require('../utils/broadcast');
const { hasCommandAccess } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('brodcast')
    .setDescription('إرسال رسالة خاصة لكل أعضاء السيرفر')
    .addStringOption(o => o.setName('الرسالة').setDescription('نص الرسالة').setRequired(true))
    .addStringOption(o => o.setName('العنوان').setDescription('عنوان الرسالة (اختياري)').setRequired(false))
    .addStringOption(o =>
      o.setName('الفئة').setDescription('مين يستلم الرسالة').setRequired(false)
        .addChoices(
          { name: 'الجميع', value: 'all' },
          { name: 'الأونلاين فقط', value: 'online' },
          { name: 'الأوفلاين فقط', value: 'offline' }
        )
    ),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'برودكاست', m => m.permissions.has(PermissionFlagsBits.Administrator))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const message = interaction.options.getString('الرسالة');
    const title = interaction.options.getString('العنوان');
    const target = interaction.options.getString('الفئة') || 'all';

    await interaction.deferReply({ ephemeral: true });

    const result = await sendDmToMembers(interaction.guild, { title, message, target });

    await interaction.editReply(`تم الإرسال ✅\nنجح: ${result.sent} | فشل: ${result.failed} (خاص مغلق أو حظر البوت) | الإجمالي المستهدف: ${result.total}`);
  },
};
