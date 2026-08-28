const { db, getGuildSettings } = require('./database');

const URL_REGEX = /https?:\/\/[^\s]+|discord\.gg\/[^\s]+|www\.[^\s]+/gi;

function extractDomain(url) {
  try {
    const withProtocol = url.startsWith('http') ? url : `https://${url}`;
    return new URL(withProtocol).hostname.replace('www.', '').toLowerCase();
  } catch {
    return null;
  }
}

function listAllowedDomains(guildId) {
  return db.prepare('SELECT domain FROM link_filter_allowed_domains WHERE guild_id = ?').all(guildId);
}

function addAllowedDomain(guildId, domain) {
  db.prepare('INSERT INTO link_filter_allowed_domains (guild_id, domain) VALUES (?, ?)').run(guildId, domain);
}

function removeAllowedDomain(guildId, domain) {
  db.prepare('DELETE FROM link_filter_allowed_domains WHERE guild_id = ? AND domain = ?').run(guildId, domain);
}

function containsDisallowedLink(guildId, content) {
  const matches = content.match(URL_REGEX);
  if (!matches) return false;

  const allowedDomains = listAllowedDomains(guildId).map(d => d.domain);
  if (allowedDomains.length === 0) return true; // ما فيه نطاقات مسموحة = كل رابط ممنوع

  return matches.some(url => {
    const domain = extractDomain(url);
    if (!domain) return true;
    return !allowedDomains.some(allowed => domain === allowed || domain.endsWith(`.${allowed}`));
  });
}

// ---------- رتب تتخطى فلتر الروابط ----------
function addLinkBypassRole(guildId, roleId) {
  const exists = db.prepare('SELECT id FROM link_filter_bypass_roles WHERE guild_id = ? AND role_id = ?').get(guildId, roleId);
  if (exists) return false;
  db.prepare('INSERT INTO link_filter_bypass_roles (guild_id, role_id) VALUES (?, ?)').run(guildId, roleId);
  return true;
}

function removeLinkBypassRole(guildId, roleId) {
  db.prepare('DELETE FROM link_filter_bypass_roles WHERE guild_id = ? AND role_id = ?').run(guildId, roleId);
}

function listLinkBypassRoles(guildId) {
  return db.prepare('SELECT role_id FROM link_filter_bypass_roles WHERE guild_id = ?').all(guildId);
}

function memberBypassesLinkFilter(member) {
  const roles = listLinkBypassRoles(member.guild.id);
  return roles.some(r => member.roles.cache.has(r.role_id));
}

module.exports = {
  containsDisallowedLink,
  addAllowedDomain,
  removeAllowedDomain,
  listAllowedDomains,
  addLinkBypassRole,
  removeLinkBypassRole,
  listLinkBypassRoles,
  memberBypassesLinkFilter,
};
