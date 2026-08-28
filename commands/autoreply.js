const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('../utils/database');
const { hasCommandAccess } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('auto-reply')
    .setDescription('إدارة الردود التلقائية')
    .addSubcommand(sub => sub.setName('اضافة').setDescription('إضافة رد تلقائي')
      .addStringOption(o => o.setName('الكلمة').setDescription('الكلمة المفتاحية').setRequired(true))
      .addStringOption(o => o.setName('الرد').setDescription('الرد التلقائي').setRequired(true))
      .addBooleanOption(o => o.setName('تطابق_تام').setDescription('لازم الرسالة تكون نفس الكلمة بالضبط؟').setRequired(false)))
    .addSubcommand(sub => sub.setName('حذف').setDescription('حذف رد تلقائي')
      .addStringOption(o => o.setName('الكلمة').setDescription('الكلمة المفتاحية').setRequired(true)))
    .addSubcommand(sub => sub.setName('عرض').setDescription('عرض كل الردود التلقائية')),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'اوتوريبلاي', m => m.permissions.has(PermissionFlagsBits.ManageGuild))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'اضافة') {
      const trigger = interaction.options.getString('الكلمة').trim();
      const response = interaction.options.getString('الرد');
      const exact = interaction.options.getBoolean('تطابق_تام') ? 1 : 0;
      db.prepare('INSERT INTO autoreplies (guild_id, trigger_word, response, exact_match) VALUES (?, ?, ?, ?)')
        .run(guildId, trigger, response, exact);
      return interaction.reply(`تم إضافة رد تلقائي على "${trigger}" ✅`);
    }

    if (sub === 'حذف') {
      const trigger = interaction.options.getString('الكلمة').trim();
      db.prepare('DELETE FROM autoreplies WHERE guild_id = ? AND trigger_word = ?').run(guildId, trigger);
      return interaction.reply(`تم حذف الرد التلقائي على "${trigger}" ✅`);
    }

    const rows = db.prepare('SELECT * FROM autoreplies WHERE guild_id = ?').all(guildId);
    if (rows.length === 0) return interaction.reply('ما فيه ردود تلقائية مضافة');
    return interaction.reply(rows.map(r => `\`${r.trigger_word}\` ← ${r.response}`).join('\n'));
  },
};
