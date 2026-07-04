const { EmbedBuilder } = require('discord.js');
const config = require('./config.js');

async function logToOwner(client, embed) {
  if (!config.logToOwner) return;
  try {
    const ids = [config.ownerID, config.adminID].filter(Boolean);
    for (const id of ids) {
      const user = await client.users.fetch(id).catch(() => null);
      if (user) await user.send({ embeds: [embed] }).catch(() => {});
    }
  } catch {}
}

module.exports = {
  async logJail(client, { mod, target, reason, duration, guild }) {
    const embed = new EmbedBuilder()
      .setColor('#1a1a2e')
      .setTitle('⛓️ لوق سجن')
      .addFields(
        { name: '👤 المسجون', value: `${target.user.tag}\n\`${target.user.id}\``, inline: true },
        { name: '👮 المشرف', value: `${mod.user.tag}\n\`${mod.user.id}\``, inline: true },
        { name: '🏠 السيرفر', value: guild.name, inline: true },
        { name: '⏳ المدة', value: duration || 'دائم', inline: true },
        { name: '📝 السبب', value: reason },
      )
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();
    await logToOwner(client, embed);
  },

  async logUnjail(client, { mod, target, reason, guild }) {
    const embed = new EmbedBuilder()
      .setColor('#00b894')
      .setTitle('🔓 لوق إفراج')
      .addFields(
        { name: '👤 المُفرج عنه', value: `${target.user.tag}\n\`${target.user.id}\``, inline: true },
        { name: '👮 المشرف', value: `${mod.user.tag}\n\`${mod.user.id}\``, inline: true },
        { name: '🏠 السيرفر', value: guild.name, inline: true },
        { name: '📝 السبب', value: reason },
      )
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();
    await logToOwner(client, embed);
  },

  async logAutoJail(client, { target, guild }) {
    const embed = new EmbedBuilder()
      .setColor('#d63031')
      .setTitle('🤖 سجن تلقائي')
      .addFields(
        { name: '👤 المسجون', value: `${target.user.tag}\n\`${target.user.id}\``, inline: true },
        { name: '🏠 السيرفر', value: guild.name, inline: true },
        { name: '📝 السبب', value: 'كرر المحاولة مرتين' },
      )
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();
    await logToOwner(client, embed);
  },
};
