const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('../utils/database');
const { hasCommandAccess } = require('../utils/permissions');

const VALID_ACTIONS = ['بان', 'كيك', 'ميوت', 'وارن', 'سجن'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shortcut')
    .setDescription('إدارة الاختصارات النصية للأوامر (مثال: كتابة "تفو" تسوي بان)')
    .addSubcommand(sub => sub.setName('اضافة').setDescription('إضافة اختصار')
      .addStringOption(o => o.setName('الكلمة').setDescription('الكلمة اللي تكتبها بدال السلاش').setRequired(true))
      .addStringOption(o => o.setName('الامر').setDescription('الأمر المرتبط').setRequired(true)
        .addChoices(...VALID_ACTIONS.map(a => ({ name: a, value: a })))))
    .addSubcommand(sub => sub.setName('حذف').setDescription('حذف اختصار')
      .addStringOption(o => o.setName('الكلمة').setDescription('الكلمة').setRequired(true)))
    .addSubcommand(sub => sub.setName('عرض').setDescription('عرض كل الاختصارات')),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'شورتكت', m => m.permissions.has(PermissionFlagsBits.Administrator))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'اضافة') {
      const trigger = interaction.options.getString('الكلمة').trim();
      const action = interaction.options.getString('الامر');
      db.prepare('INSERT INTO shortcuts (guild_id, trigger_word, action) VALUES (?, ?, ?)').run(guildId, trigger, action);
      return interaction.reply(`تم ربط كلمة "${trigger}" بأمر **${action}** ✅\nطريقة الاستخدام: اكتب \`${trigger} @العضو السبب\``);
    }

    if (sub === 'حذف') {
      const trigger = interaction.options.getString('الكلمة').trim();
      db.prepare('DELETE FROM shortcuts WHERE guild_id = ? AND trigger_word = ?').run(guildId, trigger);
      return interaction.reply(`تم حذف الاختصار "${trigger}" ✅`);
    }

    const rows = db.prepare('SELECT * FROM shortcuts WHERE guild_id = ?').all(guildId);
    if (rows.length === 0) return interaction.reply('ما فيه اختصارات مضافة');
    return interaction.reply(rows.map(r => `\`${r.trigger_word}\` ← ${r.action}`).join('\n'));
  },
};
