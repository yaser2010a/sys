const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { db, getGuildSettings } = require('./database');
const { logModAction } = require('./logger');

function isJailer(member) {
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  const roles = db.prepare('SELECT role_id FROM jailer_roles WHERE guild_id = ?').all(member.guild.id);
  return roles.some(r => member.roles.cache.has(r.role_id));
}

function addJailerRole(guildId, roleId) {
  const exists = db.prepare('SELECT id FROM jailer_roles WHERE guild_id = ? AND role_id = ?').get(guildId, roleId);
  if (exists) return false;
  db.prepare('INSERT INTO jailer_roles (guild_id, role_id) VALUES (?, ?)').run(guildId, roleId);
  return true;
}

function removeJailerRole(guildId, roleId) {
  db.prepare('DELETE FROM jailer_roles WHERE guild_id = ? AND role_id = ?').run(guildId, roleId);
}

function listJailerRoles(guildId) {
  return db.prepare('SELECT role_id FROM jailer_roles WHERE guild_id = ?').all(guildId);
}

async function syncHideRooms(guild) {
  const settings = getGuildSettings(guild.id);
  if (!settings.jail_role) return;

  const jailRole = await guild.roles.fetch(settings.jail_role).catch(() => null);
  if (!jailRole) return;

  const channels = await guild.channels.fetch();

  for (const channel of channels.values()) {
    if (!channel || channel.type === ChannelType.GuildCategory) continue;

    const isJailChannel = channel.id === settings.jail_channel;

    if (!settings.jail_hide_rooms) {
      await channel.permissionOverwrites.delete(jailRole.id).catch(() => {});
      continue;
    }

    if (isJailChannel) {
      await channel.permissionOverwrites.edit(jailRole.id, {
        ViewChannel: true,
        SendMessages: true,
      }).catch(() => {});
    } else {
      await channel.permissionOverwrites.edit(jailRole.id, {
        ViewChannel: false,
      }).catch(() => {});
    }
  }
}

function logJailAction(guildId, { userId, moderatorId, reason, action }) {
  db.prepare('INSERT INTO jail_log (guild_id, user_id, moderator_id, reason, action, timestamp) VALUES (?, ?, ?, ?, ?, ?)')
    .run(guildId, userId, moderatorId, reason || 'بدون سبب', action, Date.now());
}

function isCurrentlyJailed(guildId, userId) {
  return !!db.prepare('SELECT 1 FROM jail_state WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
}

async function jailMember({ guild, member, moderator, reason }) {
  const settings = getGuildSettings(guild.id);
  if (!settings.jail_enabled) throw new Error('NOT_ENABLED');
  if (!settings.jail_role) throw new Error('NO_ROLE');
  if (isCurrentlyJailed(guild.id, member.id)) throw new Error('ALREADY_JAILED');

  const previousRoles = member.roles.cache
    .filter(r => r.id !== guild.id)
    .map(r => r.id);

  db.prepare('INSERT OR REPLACE INTO jail_state (guild_id, user_id, previous_roles, jailed_at) VALUES (?, ?, ?, ?)')
    .run(guild.id, member.id, JSON.stringify(previousRoles), Date.now());

  await member.roles.set([settings.jail_role]).catch(async () => {
    await member.roles.add(settings.jail_role);
  });

  logJailAction(guild.id, { userId: member.id, moderatorId: moderator.id, reason, action: 'سجن' });
  logModAction(guild, { type: 'jail', action: 'سجن', target: `<@${member.id}>`, moderator: `<@${moderator.id}>`, reason });

  const embed = new EmbedBuilder()
    .setTitle('🔒 تم سجنك')
    .setDescription(`تم سجنك في سيرفر **${guild.name}**`)
    .addFields({ name: 'السبب', value: reason || 'بدون سبب' })
    .setColor('#992D22');
  await member.send({ embeds: [embed] }).catch(() => {});
}

async function unjailMember({ guild, member, moderator, reason, restorePreviousRoles }) {
  const settings = getGuildSettings(guild.id);
  if (!settings.jail_role) throw new Error('NO_ROLE');

  const state = db.prepare('SELECT * FROM jail_state WHERE guild_id = ? AND user_id = ?').get(guild.id, member.id);

  await member.roles.remove(settings.jail_role).catch(() => {});

  if (restorePreviousRoles && state) {
    const previousRoles = JSON.parse(state.previous_roles || '[]');
    const validRoles = previousRoles.filter(id => guild.roles.cache.has(id));
    if (validRoles.length) await member.roles.add(validRoles).catch(() => {});
  }

  db.prepare('DELETE FROM jail_state WHERE guild_id = ? AND user_id = ?').run(guild.id, member.id);

  const action = restorePreviousRoles ? 'فك سجن (استرجاع الرتب)' : 'عفو (بدون استرجاع الرتب)';
  logJailAction(guild.id, { userId: member.id, moderatorId: moderator.id, reason, action });
  logModAction(guild, { type: 'jail', action, target: `<@${member.id}>`, moderator: `<@${moderator.id}>`, reason });

  const embed = new EmbedBuilder()
    .setTitle(restorePreviousRoles ? '🔓 تم فك سجنك' : '🕊️ تم العفو عنك')
    .setDescription(
      restorePreviousRoles
        ? `تم فك سجنك وإرجاع رتبك السابقة في سيرفر **${guild.name}**`
        : `تم العفو عنك وإخراجك من السجن في سيرفر **${guild.name}** (بدون إرجاع رتبك السابقة)`
    )
    .setColor('#57F287');
  await member.send({ embeds: [embed] }).catch(() => {});
}

module.exports = {
  isJailer,
  addJailerRole,
  removeJailerRole,
  listJailerRoles,
  syncHideRooms,
  jailMember,
  unjailMember,
  logJailAction,
  isCurrentlyJailed,
};
