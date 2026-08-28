const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuildSettings } = require('../utils/database');
const { syncHideRooms } = require('../utils/jail');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jail-role')
    .setDescription('تحديد رتبة السجين ورتبة/قناة السجن')
    .addRoleOption(o => o.setName('الرتبة').setDescription('الرتبة اللي تنعطى للمسجونين').setRequired(true))
    .addChannelOption(o => o.setName('القناة').setDescription('قناة السجن اللي يقدر يشوفها المسجون').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const role = interaction.options.getRole('الرتبة');
    const channel = interaction.options.getChannel('القناة');

    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({ content: 'رتبة السجن لازم تكون أقل من أعلى رتبة عندي عشان أقدر أعطيها', ephemeral: true });
    }

    updateGuildSettings(interaction.guild.id, { jail_role: role.id, jail_channel: channel.id });
    await interaction.deferReply();
    await syncHideRooms(interaction.guild);

    await interaction.editReply(`تم تحديد رتبة السجن: ${role} وقناة السجن: ${channel} ✅\nتم تحديث إخفاء الرومات تلقائياً.`);
  },
};
