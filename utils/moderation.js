const { EmbedBuilder } = require('discord.js');
const { logModAction } = require('./logger');

async function dmUser(user, embed) {
  await user.send({ embeds: [embed] }).catch(() => {});
}

async function banMember({ guild, target, moderator, reason }) {
  const member = await guild.members.fetch(target.id).catch(() => null);
  await guild.members.ban(target.id, { reason: reason || 'بدون سبب' });
  logModAction(guild, { type: 'ban', action: 'حظر', target: `<@${target.id}>`, moderator: `<@${moderator.id}>`, reason });
  return member;
}

async function unbanMember({ guild, targetId, moderator, reason }) {
  await guild.members.unban(targetId, reason || 'بدون سبب');
  logModAction(guild, { type: 'unban', action: 'إلغاء حظر', target: `<@${targetId}>`, moderator: `<@${moderator.id}>`, reason });
}

async function kickMember({ guild, target, moderator, reason }) {
  const dmEmbed = new EmbedBuilder()
    .setTitle('👢 تم طردك')
    .setDescription(`تم طردك من سيرفر **${guild.name}**`)
    .addFields({ name: 'السبب', value: reason || 'بدون سبب' })
    .setColor('#ED4245');
  await dmUser(target.user ?? target, dmEmbed);

  await guild.members.kick(target.id, reason || 'بدون سبب');
  logModAction(guild, { type: 'kick', action: 'طرد', target: `<@${target.id}>`, moderator: `<@${moderator.id}>`, reason });
}

async function muteMember({ guild, target, moderator, reason, durationMs }) {
  await target.timeout(durationMs, reason || 'بدون سبب');
  logModAction(guild, { type: 'mute', action: 'كتم', target: `<@${target.id}>`, moderator: `<@${moderator.id}>`, reason });
}

async function unmuteMember({ guild, target, moderator, reason }) {
  await target.timeout(null, reason || 'بدون سبب');
  logModAction(guild, { type: 'unmute', action: 'إلغاء كتم', target: `<@${target.id}>`, moderator: `<@${moderator.id}>`, reason });
}

async function createPersistentInvite(guild) {
  const channel = guild.channels.cache.find(
    c => c.type === 0 && c.permissionsFor(guild.members.me).has('CreateInstantInvite')
  );
  if (!channel) return null;
  const invite = await channel.createInvite({ maxAge: 0, maxUses: 0 }).catch(() => null);
  return invite ? `https://discord.gg/${invite.code}` : null;
}

module.exports = { banMember, unbanMember, kickMember, muteMember, unmuteMember, createPersistentInvite };
