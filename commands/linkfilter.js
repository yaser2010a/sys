const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuildSettings } = require('../utils/database');
const {
  addLinkBypassRole, removeLinkBypassRole, listLinkBypassRoles,
  addAllowedDomain, removeAllowedDomain, listAllowedDomains,
} = require('../utils/linkFilter');
const { hasCommandAccess } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link-filter')
    .setDescription('إدارة فلتر الروابط')
    .addSubcommand(sub => sub.setName('تفعيل').setDescription('تشغيل أو إيقاف فلتر الروابط')
      .addStringOption(o => o.setName('الحالة').setDescription('تفعيل أو تعطيل').setRequired(true)
        .addChoices({ name: 'تفعيل', value: 'on' }, { name: 'تعطيل', value: 'off' })))
    .addSubcommand(sub => sub.setName('تخطي_اضافة').setDescription('إضافة رتبة تتخطى فلتر الروابط')
      .addRoleOption(o => o.setName('الرتبة').setDescription('الرتبة').setRequired(true)))
    .addSubcommand(sub => sub.setName('تخطي_حذف').setDescription('حذف رتبة من قائمة تخطي فلتر الروابط')
      .addRoleOption(o => o.setName('الرتبة').setDescription('الرتبة').setRequired(true)))
    .addSubcommand(sub => sub.setName('تخطي_عرض').setDescription('عرض الرتب اللي تتخطى فلتر الروابط'))
    .addSubcommand(sub => sub.setName('نطاق_اضافة').setDescription('السماح بنطاق معين (مثال: youtube.com)')
      .addStringOption(o => o.setName('النطاق').setDescription('مثال: youtube.com').setRequired(true)))
    .addSubcommand(sub => sub.setName('نطاق_حذف').setDescription('حذف نطاق مسموح')
      .addStringOption(o => o.setName('النطاق').setDescription('النطاق').setRequired(true)))
    .addSubcommand(sub => sub.setName('نطاق_عرض').setDescription('عرض النطاقات المسموحة')),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'فلتر_روابط', m => m.permissions.has(PermissionFlagsBits.ManageGuild))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'تفعيل') {
      const state = interaction.options.getString('الحالة');
      updateGuildSettings(guildId, { link_filter_enabled: state === 'on' ? 1 : 0 });
      return interaction.reply(`فلتر الروابط الآن: **${state === 'on' ? 'مفعّل ✅' : 'معطّل ❌'}**`);
    }

    if (sub === 'تخطي_اضافة') {
      const role = interaction.options.getRole('الرتبة');
      const added = addLinkBypassRole(guildId, role.id);
      return interaction.reply(added ? `الرتبة ${role} صارت تتخطى فلتر الروابط ✅` : 'هذي الرتبة مضافة أصلاً');
    }

    if (sub === 'تخطي_حذف') {
      const role = interaction.options.getRole('الرتبة');
      removeLinkBypassRole(guildId, role.id);
      return interaction.reply(`تم حذف ${role} من رتب تخطي فلتر الروابط ✅`);
    }

    if (sub === 'تخطي_عرض') {
      const roles = listLinkBypassRoles(guildId);
      if (roles.length === 0) return interaction.reply('ما فيه رتب تتخطى فلتر الروابط حالياً');
      return interaction.reply(`رتب تتخطى فلتر الروابط: ${roles.map(r => `<@&${r.role_id}>`).join(', ')}`);
    }

    if (sub === 'نطاق_اضافة') {
      const domain = interaction.options.getString('النطاق').toLowerCase().trim();
      addAllowedDomain(guildId, domain);
      return interaction.reply(`تم السماح بنطاق **${domain}** ✅`);
    }

    if (sub === 'نطاق_حذف') {
      const domain = interaction.options.getString('النطاق').toLowerCase().trim();
      removeAllowedDomain(guildId, domain);
      return interaction.reply(`تم حذف نطاق **${domain}** من المسموحين ✅`);
    }

    if (sub === 'نطاق_عرض') {
      const domains = listAllowedDomains(guildId);
      if (domains.length === 0) return interaction.reply('ما فيه نطاقات مسموحة (كل الروابط محظورة إذا الفلتر مفعّل)');
      return interaction.reply(`النطاقات المسموحة: ${domains.map(d => d.domain).join(', ')}`);
    }
  },
};
