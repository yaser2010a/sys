const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { CONFIGURABLE_COMMANDS, addCommandRole, removeCommandRole, getCommandRoles } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('permissions')
    .setDescription('تحديد رتب تقدر تستخدم أوامر معينة بغض النظر عن صلاحيات ديسكورد')
    .addSubcommand(sub => sub.setName('اضافة').setDescription('السماح لرتبة باستخدام أمر معين')
      .addStringOption(o => {
        o.setName('الامر').setDescription('الأمر').setRequired(true);
        o.addChoices(...CONFIGURABLE_COMMANDS.map(c => ({ name: c.label, value: c.name })));
        return o;
      })
      .addRoleOption(o => o.setName('الرتبة').setDescription('الرتبة').setRequired(true)))
    .addSubcommand(sub => sub.setName('حذف').setDescription('إزالة صلاحية أمر عن رتبة')
      .addStringOption(o => {
        o.setName('الامر').setDescription('الأمر').setRequired(true);
        o.addChoices(...CONFIGURABLE_COMMANDS.map(c => ({ name: c.label, value: c.name })));
        return o;
      })
      .addRoleOption(o => o.setName('الرتبة').setDescription('الرتبة').setRequired(true)))
    .addSubcommand(sub => sub.setName('عرض').setDescription('عرض الرتب المسموحة لأمر معين')
      .addStringOption(o => {
        o.setName('الامر').setDescription('الأمر').setRequired(true);
        o.addChoices(...CONFIGURABLE_COMMANDS.map(c => ({ name: c.label, value: c.name })));
        return o;
      }))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const commandName = interaction.options.getString('الامر');
    const guildId = interaction.guild.id;

    if (sub === 'اضافة') {
      const role = interaction.options.getRole('الرتبة');
      const added = addCommandRole(guildId, commandName, role.id);
      return interaction.reply(added
        ? `الرتبة ${role} صار تقدر تستخدم أمر **${commandName}** ✅`
        : 'هذي الرتبة عندها الصلاحية أصلاً');
    }

    if (sub === 'حذف') {
      const role = interaction.options.getRole('الرتبة');
      removeCommandRole(guildId, commandName, role.id);
      return interaction.reply(`تم إزالة صلاحية أمر **${commandName}** عن ${role} ✅`);
    }

    if (sub === 'عرض') {
      const roles = getCommandRoles(guildId, commandName);
      if (roles.length === 0) return interaction.reply(`ما فيه رتب إضافية مسموحة لأمر **${commandName}** (فقط الأدمن والصلاحية الافتراضية)`);
      return interaction.reply(`الرتب المسموحة لأمر **${commandName}**: ${roles.map(r => `<@&${r.role_id}>`).join(', ')}`);
    }
  },
};
