const { EmbedBuilder } = require('discord.js');
const { db } = require('./database');

async function endGiveaway(client, giveaway) {
  const channel = await client.channels.fetch(giveaway.channel_id).catch(() => null);
  if (!channel) {
    db.prepare('UPDATE giveaways SET ended = 1 WHERE id = ?').run(giveaway.id);
    return;
  }

  const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
  db.prepare('UPDATE giveaways SET ended = 1 WHERE id = ?').run(giveaway.id);

  if (!message) return;

  const reaction = message.reactions.cache.get('🎉');
  const users = reaction ? await reaction.users.fetch() : new Map();
  const entrants = [...users.values()].filter(u => !u.bot);

  if (entrants.length === 0) {
    const failEmbed = new EmbedBuilder()
      .setTitle('🎉 انتهت القيف اواي')
      .setDescription(`**${giveaway.prize}**\n\nما أحد شارك 😢`)
      .setColor('#ED4245');
    return message.edit({ embeds: [failEmbed] });
  }

  const winners = [];
  const pool = [...entrants];
  const count = Math.min(giveaway.winners_count, pool.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    winners.push(pool.splice(idx, 1)[0]);
  }

  const winnerMentions = winners.map(w => `<@${w.id}>`).join(', ');

  const embed = new EmbedBuilder()
    .setTitle('🎉 انتهت القيف اواي')
    .setDescription(`**${giveaway.prize}**\n\nالفائز/الفائزين: ${winnerMentions}`)
    .setColor('#57F287');

  await message.edit({ embeds: [embed] });
  await channel.send(`تهانينا ${winnerMentions}! فزتوا بـ **${giveaway.prize}** 🎉`);
}

async function startGiveaway({ channel, prize, durationMs, winnersCount, hostId }) {
  const endTime = Date.now() + durationMs;

  const embed = new EmbedBuilder()
    .setTitle('🎉 قيف اواي!')
    .setDescription(`**الجائزة:** ${prize}\n**عدد الفائزين:** ${winnersCount}\n**تنتهي:** <t:${Math.floor(endTime / 1000)}:R>\n\nتفاعل بـ 🎉 عشان تدخل السحب!`)
    .setColor('#F1C40F')
    .setFooter({ text: `بواسطة ${hostId ? `<@${hostId}>` : 'الداشبورد'}` });

  const message = await channel.send({ embeds: [embed] });
  await message.react('🎉');

  db.prepare('INSERT INTO giveaways (guild_id, channel_id, message_id, prize, winners_count, end_time, host_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(channel.guild.id, channel.id, message.id, prize, winnersCount, endTime, hostId || null);

  return message;
}

function startGiveawayChecker(client) {
  setInterval(async () => {
    const now = Date.now();
    const due = db.prepare('SELECT * FROM giveaways WHERE ended = 0 AND end_time <= ?').all(now);
    for (const giveaway of due) {
      await endGiveaway(client, giveaway);
    }
  }, 15000);
}

module.exports = { startGiveawayChecker, endGiveaway, startGiveaway };
