const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('../utils/database');
const { endGiveaway, startGiveaway } = require('../utils/giveawayManager');
const { hasCommandAccess } = require('../utils/permissions');

const UNITS = { 'د': 60000, 'س': 3600000, 'ي': 86400000 };
function parseDuration(input) {
  const match = input.match(/^(\d+)(د|س|ي)$/);
  if (!match) return null;
  return parseInt(match[1]) * UNITS[match[2]];
}

module.exports = {
 data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('إدارة القيف اواي')
    .addSubcommand(sub => 
      sub.setName('بدء')
        .setDescription('بدء قيف اواي جديدة')
        .addStringOption(o => o.setName('الجائزة').setDescription('اسم الجائزة').setRequired(true))
        .addStringOption(o => o.setName('المدة').setDescription('مثال: 10د / 2س / 1ي').setRequired(true))
        // تم تغيير addUserOption إلى addStringOption لأنك تستخدمها كنص (وصف) في الكود
        .addStringOption(o => o.setName('وصف_القيف_اواي').setDescription('وصف القيف اواي').setRequired(false))
        .addIntegerOption(o => o.setName('عدد_الفائزين').setDescription('عدد الفائزين').setRequired(false))
    )
    .addSubcommand(sub => 
      sub.setName('انهاء')
        .setDescription('إنهاء قيف اواي فوراً')
        .addStringOption(o => o.setName('ايدي_الرسالة').setDescription('آيدي رسالة القيف اواي').setRequired(true))
    ),
  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'قيف_اواي', m => m.permissions.has(PermissionFlagsBits.ManageGuild))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();

    if (sub === 'بدء') {
      const prize = interaction.options.getString('الجائزة');
      const durationInput = interaction.options.getString('المدة');
      const winnersCount = interaction.options.getInteger('عدد_الفائزين'); 
      const description = interaction.options.getString('وصف_القيف_اواي') || 'لا يوجد وصف';

      const durationMs = parseDuration(durationInput);
      if (!durationMs) {
        return interaction.reply({ content: 'صيغة المدة غير صحيحة. استخدم مثل: 10د أو 2س أو 1ي', ephemeral: true });
      }

      await interaction.deferReply({ ephemeral: true });
      await startGiveaway({ channel: interaction.channel, prize, durationMs, winnersCount, hostId: interaction.user.id });
      await interaction.editReply('تم بدء القيف اواي ✅');
    }

    if (sub === 'انهاء') {
      const messageId = interaction.options.getString('ايدي_الرسالة');
      const giveaway = db.prepare('SELECT * FROM giveaways WHERE guild_id = ? AND message_id = ? AND ended = 0')
        .get(interaction.guild.id, messageId);

      if (!giveaway) return interaction.reply({ content: 'ما لقيت قيف اواي نشطة بهذا الآيدي', ephemeral: true });

      await interaction.reply({ content: 'جاري إنهاء القيف اواي...', ephemeral: true });
      await endGiveaway(interaction.client, giveaway);
    }
  },
};
