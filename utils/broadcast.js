const { EmbedBuilder } = require('discord.js');

/**
 * يرسل رسالة خاصة (DM) لأعضاء السيرفر حسب الفئة المطلوبة.
 * target: 'all' | 'online' | 'offline'
 * يرجع { sent, failed, skipped }
 */
async function sendDmToMembers(guild, { title, message, target = 'all' }) {
  const members = await guild.members.fetch();

  const filtered = members.filter(member => {
    if (member.user.bot) return false;

    if (target === 'all') return true;

    const status = member.presence?.status; // online | idle | dnd | undefined(offline)
    const isOnline = status === 'online' || status === 'idle' || status === 'dnd';

    if (target === 'online') return isOnline;
    if (target === 'offline') return !isOnline;
    return true;
  });

  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setDescription(message)
    .setFooter({ text: `رسالة من إدارة سيرفر ${guild.name}` })
    .setTimestamp();

  if (title) embed.setTitle(title);

  let sent = 0;
  let failed = 0;

  for (const member of filtered.values()) {
    try {
      await member.send({ embeds: [embed] });
      sent++;
    } catch {
      failed++;
    }
  }

  return { sent, failed, total: filtered.size };
}

module.exports = { sendDmToMembers };
