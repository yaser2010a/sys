const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addJailerRole, removeJailerRole, listJailerRoles } = require('../utils/jail');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jailer-roles')
    .setDescription('إدارة الرتب المسموح لها تستخدم أوامر السجن')
    .addSubcommand(sub => sub.setName('اضافة').setDescription('إضافة رتبة سجان')
      .addRoleOption(o => o.setName('الرتبة').setDescription('الرتبة').setRequired(true)))
    .addSubcommand(sub => sub.setName('حذف').setDescription('حذف رتبة سجان')
      .addRoleOption(o => o.setName('الرتبة').setDescription('الرتبة').setRequired(true)))
    .addSubcommand(sub => sub.setName('عرض').setDescription('عرض رتب السجانين'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'اضافة') {
      const role = interaction.options.getRole('الرتبة');
      const added = addJailerRole(interaction.guild.id, role.id);
      return interaction.reply(added ? `تم إضافة ${role} كرتبة سجان ✅` : 'هذي الرتبة مضافة أصلاً');
    }

    if (sub === 'حذف') {
      const role = interaction.options.getRole('الرتبة');
      removeJailerRole(interaction.guild.id, role.id);
      return interaction.reply(`تم حذف ${role} من رتب السجانين ✅`);
    }

    const roles = listJailerRoles(interaction.guild.id);
    if (roles.length === 0) return interaction.reply('ما فيه رتب سجانين مضافة (فقط الأدمن يقدر يستخدم أوامر السجن)');
    return interaction.reply(`رتب السجانين: ${roles.map(r => `<@&${r.role_id}>`).join(', ')}`);
  },
};
