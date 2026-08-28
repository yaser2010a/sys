const { db } = require('./database');

// قائمة الأوامر القابلة للتخصيص (تظهر بالداشبورد وأمر /صلاحيات)
const CONFIGURABLE_COMMANDS = [
  { name: 'بان', label: 'بان' },
  { name: 'انبان', label: 'انبان' },
  { name: 'كيك', label: 'كيك' },
  { name: 'ميوت', label: 'ميوت' },
  { name: 'انميوت', label: 'انميوت' },
  { name: 'وارن', label: 'وارن' },
  { name: 'قول', label: 'قول (Say)' },
  { name: 'فلتر', label: 'إدارة الفلتر' },
  { name: 'شورتكت', label: 'إدارة الشورت كتس' },
  { name: 'اوتوريبلاي', label: 'إدارة الأوتو ريبلاي' },
  { name: 'اعدادات', label: 'الإعدادات العامة' },
  { name: 'ايمبد', label: 'الايمبد بيلدر' },
  { name: 'قيف_اواي', label: 'القيف اواي' },
  { name: 'مسح', label: 'مسح الرسائل' },
  { name: 'roleconfig', label: 'إدارة الرتب التفاعلية' },
  { name: 'rolepanel', label: 'نشر لوحة الرتب' },
  { name: 'zajelpanel', label: 'نشر لوحة الزاجل' },
  { name: 'برودكاست', label: 'البرودكاست (رسائل خاصة جماعية)' },
  { name: 'ارسل طاولة القوانين', label: 'إرسال طاولة القوانين' },
];

function getCommandRoles(guildId, commandName) {
  return db.prepare('SELECT role_id FROM command_permissions WHERE guild_id = ? AND command_name = ?')
    .all(guildId, commandName);
}

function addCommandRole(guildId, commandName, roleId) {
  const exists = db.prepare('SELECT id FROM command_permissions WHERE guild_id = ? AND command_name = ? AND role_id = ?')
    .get(guildId, commandName, roleId);
  if (exists) return false;
  db.prepare('INSERT INTO command_permissions (guild_id, command_name, role_id) VALUES (?, ?, ?)')
    .run(guildId, commandName, roleId);
  return true;
}

function removeCommandRole(guildId, commandName, roleId) {
  db.prepare('DELETE FROM command_permissions WHERE guild_id = ? AND command_name = ? AND role_id = ?')
    .run(guildId, commandName, roleId);
}

function getAllCommandPermissions(guildId) {
  return db.prepare('SELECT * FROM command_permissions WHERE guild_id = ?').all(guildId);
}

/**
 * يتحقق من صلاحية العضو لتنفيذ أمر معين.
 * يسمح إذا: عنده صلاحية الأدمن، أو حقق شرط الصلاحية الافتراضية (defaultCheck)،
 * أو كانت رتبته مضافة يدوياً لهذا الأمر من الداشبورد/أمر الصلاحيات.
 */
function hasCommandAccess(member, commandName, defaultCheck) {
  if (member.permissions.has('Administrator')) return true;
  if (typeof defaultCheck === 'function' && defaultCheck(member)) return true;

  const roles = getCommandRoles(member.guild.id, commandName);
  return roles.some(r => member.roles.cache.has(r.role_id));
}

module.exports = {
  CONFIGURABLE_COMMANDS,
  getCommandRoles,
  addCommandRole,
  removeCommandRole,
  getAllCommandPermissions,
  hasCommandAccess,
};
