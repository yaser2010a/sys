const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { CATEGORIES } = require('../utils/selfRoles');

const categoryChoices = Object.entries(CATEGORIES).map(([key, label]) => ({
  name: label,
  value: key
}));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleconfig')
    .setDescription('اضافة وتعديل االرتب في لوحة الرتب')
    .addSubcommand(sub => sub.setName('add').setDescription('Add a role to a category')
      .addStringOption(o => o.setName('category').setDescription('القسم').setRequired(true).addChoices(...categoryChoices))
      .addRoleOption(o => o.setName('role').setDescription('الرتبة').setRequired(true)))
    .addSubcommand(sub => sub.setName('remove').setDescription('Remove a role from a category')
      .addStringOption(o => o.setName('category').setDescription('القسم').setRequired(true).addChoices(...categoryChoices))
      .addRoleOption(o => o.setName('role').setDescription('الرتبة').setRequired(true)))
    .addSubcommand(sub => sub.setName('list').setDescription('List roles in a category')
      .addStringOption(o => o.setName('category').setDescription('القسم').setRequired(true).addChoices(...categoryChoices)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    
  },
};