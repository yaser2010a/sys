const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('server-info').setDescription('معلومات عن السيرفر'),

  async execute(interaction) {
    const guild = interaction.guild;
    await guild.members.fetch();

    const humans = guild.members.cache.filter(m => !m.user.bot).size;
    const bots = guild.members.cache.filter(m => m.user.bot).size;

    const embed = new EmbedBuilder()
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ size: 512 }))
      .setColor('#5865F2')
      .addFields(
        { name: '👑 المالك', value: `<@${guild.ownerId}>`, inline: true },
        { name: '🆔 الآيدي', value: guild.id, inline: true },
        { name: '📅 تاريخ الإنشاء', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '👥 الأعضاء', value: `${guild.memberCount}`, inline: true },
        { name: '🧑 بشر', value: `${humans}`, inline: true },
        { name: '🤖 بوتات', value: `${bots}`, inline: true },
        { name: '💬 القنوات النصية', value: `${guild.channels.cache.filter(c => c.type === 0).size}`, inline: true },
        { name: '🔊 القنوات الصوتية', value: `${guild.channels.cache.filter(c => c.type === 2).size}`, inline: true },
        { name: '🎭 الرتب', value: `${guild.roles.cache.size}`, inline: true }
      )
      .setFooter({ text: `مستوى البوست: ${guild.premiumTier} | البوستات: ${guild.premiumSubscriptionCount ?? 0}` });

    await interaction.reply({ embeds: [embed] });
  },
};
