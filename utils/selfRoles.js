const { db } = require('./database');

const CATEGORIES = {
  reactive: 'الرتب التفاعلية',
  special: 'الرتب الخاصة',
  purchase: 'الرتب الشرائية',
};

function addRoleToCategory(guildId, category, roleId) {
  const exists = db.prepare('SELECT id FROM self_roles WHERE guild_id = ? AND category = ? AND role_id = ?')
    .get(guildId, category, roleId);
  if (exists) return false;
  db.prepare('INSERT INTO self_roles (guild_id, category, role_id) VALUES (?, ?, ?)').run(guildId, category, roleId);
  return true;
}

function removeRoleFromCategory(guildId, category, roleId) {
  db.prepare('DELETE FROM self_roles WHERE guild_id = ? AND category = ? AND role_id = ?').run(guildId, category, roleId);
}

function listRolesInCategory(guildId, category) {
  return db.prepare('SELECT role_id FROM self_roles WHERE guild_id = ? AND category = ?').all(guildId, category);
}

function listAllSelfRoles(guildId) {
  return db.prepare('SELECT * FROM self_roles WHERE guild_id = ?').all(guildId);
}

module.exports = {
  CATEGORIES,
  addRoleToCategory,
  removeRoleFromCategory,
  listRolesInCategory,
  listAllSelfRoles,
};
