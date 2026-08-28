const { db, getGuildSettings } = require('./database');
const { EmbedBuilder } = require('discord.js');

function xpForLevel(level) {
  return 5 * (level ** 2) + 50 * level + 100;
}

async function addTextXp(message) {
  const guildId = message.guild.id;
  const userId = message.author.id;
  const now = Date.now();

  let row = db.prepare('SELECT * FROM text_levels WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
  if (!row) {
    db.prepare('INSERT INTO text_levels (guild_id, user_id, xp, level, last_message_ts) VALUES (?, ?, 0, 0, 0)').run(guildId, userId);
    row = { xp: 0, level: 0, last_message_ts: 0 };
  }

  if (now - row.last_message_ts < 60000) return;

  const gained = Math.floor(Math.random() * 10) + 15;
  let newXp = row.xp + gained;
  let newLevel = row.level;

  if (newXp >= xpForLevel(newLevel)) {
    newXp -= xpForLevel(newLevel);
    newLevel += 1;
    await announceLevelUp(message.guild, message.author, newLevel, 'text', message.channel);
  }

  db.prepare('UPDATE text_levels SET xp = ?, level = ?, last_message_ts = ? WHERE guild_id = ? AND user_id = ?')
    .run(newXp, newLevel, now, guildId, userId);
}

function startVoiceSession(guildId, userId) {
  db.prepare('INSERT OR REPLACE INTO voice_sessions (guild_id, user_id, join_ts) VALUES (?, ?, ?)')
    .run(guildId, userId, Date.now());
}

async function endVoiceSession(guild, userId) {
  const guildId = guild.id;
  const session = db.prepare('SELECT * FROM voice_sessions WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
  if (!session) return;
  db.prepare('DELETE FROM voice_sessions WHERE guild_id = ? AND user_id = ?').run(guildId, userId);

  const minutes = Math.floor((Date.now() - session.join_ts) / 60000);
  if (minutes < 1) return;

  let row = db.prepare('SELECT * FROM voice_levels WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
  if (!row) {
    db.prepare('INSERT INTO voice_levels (guild_id, user_id, xp, level) VALUES (?, ?, 0, 0)').run(guildId, userId);
    row = { xp: 0, level: 0 };
  }

  let newXp = row.xp + minutes * 5;
  let newLevel = row.level;
  let leveledUp = false;

  while (newXp >= xpForLevel(newLevel)) {
    newXp -= xpForLevel(newLevel);
    newLevel += 1;
    leveledUp = true;
  }

  db.prepare('UPDATE voice_levels SET xp = ?, level = ? WHERE guild_id = ? AND user_id = ?')
    .run(newXp, newLevel, guildId, userId);

  if (leveledUp) {
    const member = await guild.members.fetch(userId).catch(() => null);
    if (member) await announceLevelUp(guild, member.user, newLevel, 'voice', null);
  }
}

async function announceLevelUp(guild, user, level, type, fallbackChannel) {
  const settings = getGuildSettings(guild.id);
  const channelId = type === 'text' ? settings.level_text_channel : settings.level_voice_channel;
  const template = type === 'text' ? settings.level_text_message : settings.level_voice_message;

  const channel = channelId
    ? await guild.channels.fetch(channelId).catch(() => null)
    : fallbackChannel;

  if (!channel) return;

  const defaultMsg = type === 'text'
    ? `مبروك {user} وصلت المستوى **{level}** بالكتابة! 🎉`
    : `مبروك {user} وصلت المستوى **{level}** بالروم الصوتي! 🎙️`;

  const text = (template || defaultMsg)
    .replaceAll('{user}', `<@${user.id}>`)
    .replaceAll('{level}', level);

  const embed = new EmbedBuilder().setDescription(text).setColor('#5865F2');
  channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { xpForLevel, addTextXp, startVoiceSession, endVoiceSession };
