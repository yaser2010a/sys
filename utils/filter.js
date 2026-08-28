const { db } = require('./database');

// قائمة أساسية، الإدارة تقدر تضيف/تحذف كلمات من الداشبورد أو أمر /فلتر بدون لمس الكود
const DEFAULT_WORDS = [
  'قحبة', 'ابن القحبة', 'بنت القحبة',
  'ابن الزانية', 'بنت الزانية', 'زاني', 'زانية',
  'ابن العاهرة', 'بنت العاهرة',
  'ابن الشرموطة', 'بنت الشرموطة',
  'امك قحبة', 'ابوك قحبة',
  'امك شرموطة', 'ابوك شرموطة',
  'امك زانية', 'ابوك زانية',
  'لوطي', 'متناك',
  'fuck', 'fucking', 'fucker', 'motherfucker',
  'bitch', 'son of a bitch', 'asshole', 'bastard',
  'slut', 'whore', 'dick', 'pussy', 'cunt',
];

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/\s+/g, '');
}

function getGuildWords(guildId) {
  const rows = db.prepare('SELECT word FROM filter_words WHERE guild_id = ?').all(guildId);
  return [...DEFAULT_WORDS, ...rows.map(r => r.word)];
}

function containsBannedWord(guildId, content) {
  const normalizedContent = normalize(content);
  const words = getGuildWords(guildId);
  return words.some(w => w && normalizedContent.includes(normalize(w)));
}

function addWord(guildId, word) {
  db.prepare('INSERT INTO filter_words (guild_id, word) VALUES (?, ?)').run(guildId, word);
}

function removeWord(guildId, word) {
  db.prepare('DELETE FROM filter_words WHERE guild_id = ? AND word = ?').run(guildId, word);
}

function listWords(guildId) {
  return db.prepare('SELECT id, word FROM filter_words WHERE guild_id = ?').all(guildId);
}

// ---------- رتب تتخطى فلتر السب ----------
function addBypassRole(guildId, roleId) {
  const exists = db.prepare('SELECT id FROM filter_bypass_roles WHERE guild_id = ? AND role_id = ?').get(guildId, roleId);
  if (exists) return false;
  db.prepare('INSERT INTO filter_bypass_roles (guild_id, role_id) VALUES (?, ?)').run(guildId, roleId);
  return true;
}

function removeBypassRole(guildId, roleId) {
  db.prepare('DELETE FROM filter_bypass_roles WHERE guild_id = ? AND role_id = ?').run(guildId, roleId);
}

function listBypassRoles(guildId) {
  return db.prepare('SELECT role_id FROM filter_bypass_roles WHERE guild_id = ?').all(guildId);
}

function memberBypassesFilter(member) {
  const roles = listBypassRoles(member.guild.id);
  return roles.some(r => member.roles.cache.has(r.role_id));
}

module.exports = {
  containsBannedWord, addWord, removeWord, listWords, getGuildWords,
  addBypassRole, removeBypassRole, listBypassRoles, memberBypassesFilter,
};