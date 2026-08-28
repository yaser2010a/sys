const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuildSettings, getGuildSettings } = require('../utils/database');
const { syncHideRooms } = require('../utils/jail');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jail-toggle')
    .setDescription('تشغيل أو إيقاف نظام السجن')
    .addStringOption(o =>
      o.setName('الحالة').setDescription('تفعيل أو تعطيل').setRequired(true)
        .addChoices({ name: 'تفعيل', value: 'on' }, { name: 'تعطيل', value: 'off' })
    )
    .addStringOption(o =>
      o.setName('اخفاء_الرومات').setDescription('إخفاء كل الرومات عن المسجون إلا قناة السجن').setRequired(false)
        .addChoices({ name: 'تفعيل', value: 'on' }, { name: 'تعطيل', value: 'off' })
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const state = interaction.options.getString('الحالة');
    const hideRooms = interaction.options.getString('اخفاء_الرومات');
    const settings = getGuildSettings(interaction.guild.id);

    if (state === 'on' && !settings.jail_role) {
      return interaction.reply({ content: 'حدد رتبة وقناة السجن أول بأمر `/سجن_رتبة`', ephemeral: true });
    }

    const update = { jail_enabled: state === 'on' ? 1 : 0 };
    if (hideRooms) update.jail_hide_rooms = hideRooms === 'on' ? 1 : 0;
    updateGuildSettings(interaction.guild.id, update);

    await interaction.deferReply();
    if (hideRooms) await syncHideRooms(interaction.guild);

    await interaction.editReply(`نظام السجن الآن: **${state === 'on' ? 'مفعّل ✅' : 'معطّل ❌'}**`);
  },
};
