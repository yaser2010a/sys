const { EmbedBuilder } = require('discord.js');
const { getGuildSettings } = require('../utils/database');
const { logMember } = require('../utils/logger');

function applyPlaceholders(text, member, guild) {
  if (!text) return text;
  let result = text
    .replaceAll('{user}', member.user.tag)
    .replaceAll('{username}', member.user.username)
    .replaceAll('{server}', guild.name)
    .replaceAll('{membercount}', guild.memberCount);

  result = result.replace(/\(#?([^)]+)\)/g, (match, roomName) => {
    const channel = guild.channels.cache.find(
      c => c.name === roomName.trim() || c.name === roomName.trim().replace('#', '')
    );
    return channel ? `<#${channel.id}>` : match;
  });

  return result;
}

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const settings = getGuildSettings(member.guild.id);

    if (settings.leave_channel) {
      const channel = await member.guild.channels.fetch(settings.leave_channel).catch(() => null);
      if (channel) {
        const defaultMsg = 'وداعاً {user}، نتمنى لك التوفيق 👋';
        const description = applyPlaceholders(settings.leave_message || defaultMsg, member, member.guild);

        const embed = new EmbedBuilder()
          .setDescription(description)
          .setColor(settings.leave_embed_color || '#ED4245')
          .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
          .setTimestamp();

        if (settings.leave_title) embed.setTitle(applyPlaceholders(settings.leave_title, member, member.guild));
        if (settings.leave_image) embed.setImage(settings.leave_image);

        channel.send({ embeds: [embed] }).catch(() => {});
      }
    }

    logMember(member.guild, `📤 **${member.user.tag}** غادر السيرفر`, '#ED4245');
  },
};
