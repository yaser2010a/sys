const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addWord, removeWord, listWords, addBypassRole, removeBypassRole, listBypassRoles } = require('../utils/filter');
const { updateGuildSettings } = require('../utils/database');
const { hasCommandAccess } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('word-filter')
    .setDescription('إدارة فلتر السب والقذف')
    .addSubcommand(sub => sub.setName('اضافة').setDescription('إضافة كلمة للفلتر')
      .addStringOption(o => o.setName('كلمة').setDescription('الكلمة المراد حظرها').setRequired(true)))
    .addSubcommand(sub => sub.setName('حذف').setDescription('حذف كلمة من الفلتر')
      .addStringOption(o => o.setName('كلمة').setDescription('الكلمة').setRequired(true)))
    .addSubcommand(sub => sub.setName('عرض').setDescription('عرض قائمة الكلمات المحظورة (خاص فقط)'))
    .addSubcommand(sub => sub.setName('تفعيل').setDescription('تشغيل أو إيقاف الفلتر')
      .addStringOption(o => o.setName('الحالة').setDescription('تفعيل أو تعطيل').setRequired(true)
        .addChoices({ name: 'تفعيل', value: 'on' }, { name: 'تعطيل', value: 'off' })))
    .addSubcommand(sub => sub.setName('تخطي_اضافة').setDescription('إضافة رتبة تتخطى فلتر السب')
      .addRoleOption(o => o.setName('الرتبة').setDescription('الرتبة').setRequired(true)))
    .addSubcommand(sub => sub.setName('تخطي_حذف').setDescription('حذف رتبة من قائمة تخطي الفلتر')
      .addRoleOption(o => o.setName('الرتبة').setDescription('الرتبة').setRequired(true)))
    .addSubcommand(sub => sub.setName('تخطي_عرض').setDescription('عرض الرتب اللي تتخطى فلتر السب')),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'فلتر', m => m.permissions.has(PermissionFlagsBits.ManageGuild))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'اضافة') {
      const word = interaction.options.getString('كلمة');
      addWord(guildId, word);
      return interaction.reply({ content: 'تم إضافة الكلمة للفلتر ✅', ephemeral: true });
    }

    if (sub === 'حذف') {
      const word = interaction.options.getString('كلمة');
      removeWord(guildId, word);
      return interaction.reply({ content: 'تم حذف الكلمة من الفلتر ✅', ephemeral: true });
    }

    if (sub === 'عرض') {
      const words = listWords(guildId);
      if (words.length === 0) return interaction.reply({ content: 'ما فيه كلمات مضافة يدوياً بعد', ephemeral: true });
      return interaction.reply({ content: words.map(w => w.word).join(', '), ephemeral: true });
    }

    if (sub === 'تفعيل') {
      const state = interaction.options.getString('الحالة');
      updateGuildSettings(guildId, { filter_enabled: state === 'on' ? 1 : 0 });
      return interaction.reply(`فلتر السب والقذف الآن: **${state === 'on' ? 'مفعّل ✅' : 'معطّل ❌'}**`);
    }

    if (sub === 'تخطي_اضافة') {
      const role = interaction.options.getRole('الرتبة');
      const added = addBypassRole(guildId, role.id);
      return interaction.reply(added ? `الرتبة ${role} صارت تتخطى فلتر السب ✅` : 'هذي الرتبة مضافة أصلاً');
    }

    if (sub === 'تخطي_حذف') {
      const role = interaction.options.getRole('الرتبة');
      removeBypassRole(guildId, role.id);
      return interaction.reply(`تم حذف ${role} من رتب تخطي الفلتر ✅`);
    }

    if (sub === 'تخطي_عرض') {
      const roles = listBypassRoles(guildId);
      if (roles.length === 0) return interaction.reply('ما فيه رتب تتخطى الفلتر حالياً');
      return interaction.reply(`رتب تتخطى الفلتر: ${roles.map(r => `<@&${r.role_id}>`).join(', ')}`);
    }
  },
};
