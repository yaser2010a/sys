const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const { hasCommandAccess } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('فتح الشات (السماح للأعضاء بالكتابة)')
    .addChannelOption(o => o.setName('channel').setDescription('القناة (اختياري، الافتراضي هذي القناة)').addChannelTypes(ChannelType.GuildText).setRequired(false)),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'unlock', m => m.permissions.has(PermissionFlagsBits.ManageChannels))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const overwrite = channel.permissionOverwrites.cache.get(interaction.guild.id);
    const isLocked = overwrite?.deny.has(PermissionFlagsBits.SendMessages);

    if (!isLocked) {
      return interaction.reply({ content: `${channel} مفتوحة أصلاً 🔓`, ephemeral: true });
    }

    await channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null }, {
      reason: `فتح بواسطة ${interaction.user.tag}`,
    });

    const embed = new EmbedBuilder()
      .setTitle('🔓 تم فتح الشات')
      .setDescription('يقدر الأعضاء يكتبون بهذي القناة الحين')
      .setColor('#57F287');

    await channel.send({ embeds: [embed] }).catch(() => {});

    if (channel.id === interaction.channel.id) {
      await interaction.reply({ content: 'تم فتح القناة ✅', ephemeral: true });
    } else {
      await interaction.reply({ content: `تم فتح ${channel} ✅`, ephemeral: true });
    }
  },
};