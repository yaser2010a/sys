const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const { hasCommandAccess } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('قفل الشات (منع الأعضاء من الكتابة)')
    .addChannelOption(o => o.setName('channel').setDescription('القناة (اختياري، الافتراضي هذي القناة)').addChannelTypes(ChannelType.GuildText).setRequired(false))
    .addStringOption(o => o.setName('reason').setDescription('السبب (اختياري)').setRequired(false)),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'lock', m => m.permissions.has(PermissionFlagsBits.ManageChannels))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason');

    const alreadyLocked = channel.permissionOverwrites.cache
      .get(interaction.guild.id)?.deny.has(PermissionFlagsBits.SendMessages);

    if (alreadyLocked) {
      return interaction.reply({ content: `${channel} مقفولة أصلاً 🔒`, ephemeral: true });
    }

    await channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false }, {
      reason: reason || `قفل بواسطة ${interaction.user.tag}`,
    });

    const embed = new EmbedBuilder()
      .setTitle('🔒 تم قفل الشات')
      .setDescription(reason ? `السبب: ${reason}` : 'ممنوع الكتابة حالياً بهذي القناة')
      .setColor('#ED4245');

    await channel.send({ embeds: [embed] }).catch(() => {});

    if (channel.id === interaction.channel.id) {
      await interaction.reply({ content: 'تم قفل القناة ✅', ephemeral: true });
    } else {
      await interaction.reply({ content: `تم قفل ${channel} ✅`, ephemeral: true });
    }
  },
};