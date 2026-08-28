const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'bot.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS guild_settings (
  guild_id TEXT PRIMARY KEY,
  welcome_channel TEXT,
  welcome_message TEXT,
  welcome_title TEXT,
  welcome_embed_color TEXT DEFAULT '#5865F2',
  welcome_image TEXT,
  welcome_thumbnail TEXT,
  welcome_use_avatar_thumbnail INTEGER DEFAULT 1,
  welcome_footer TEXT,
  leave_channel TEXT,
  leave_message TEXT,
  leave_title TEXT,
  leave_embed_color TEXT DEFAULT '#ED4245',
  leave_image TEXT,
  log_message TEXT,
  log_reaction TEXT,
  log_member TEXT,
  log_voice TEXT,
  log_ban TEXT,
  log_kick TEXT,
  log_unban TEXT,
  log_mute TEXT,
  log_unmute TEXT,
  log_warn TEXT,
  log_jail TEXT,
  level_text_channel TEXT,
  level_text_message TEXT,
  level_voice_channel TEXT,
  level_voice_message TEXT,
  apply_channel TEXT,
  apply_role TEXT,
  filter_enabled INTEGER DEFAULT 1,
  filter_action TEXT DEFAULT 'delete',
  jail_enabled INTEGER DEFAULT 0,
  jail_role TEXT,
  jail_channel TEXT,
  jail_hide_rooms INTEGER DEFAULT 1,
  link_filter_enabled INTEGER DEFAULT 0,
  trap_enabled INTEGER DEFAULT 0,
  trap_channel TEXT,
  trap_server_name TEXT,
  trap_dm_message TEXT,
  trap_contact TEXT DEFAULT '768a'
);

CREATE TABLE IF NOT EXISTS rule_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  name TEXT,
  content TEXT
);

CREATE TABLE IF NOT EXISTS trap_cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  user_id TEXT,
  timestamp INTEGER
);

CREATE TABLE IF NOT EXISTS self_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  category TEXT,
  role_id TEXT
);

CREATE TABLE IF NOT EXISTS command_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  command_name TEXT,
  role_id TEXT
);

CREATE TABLE IF NOT EXISTS filter_bypass_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  role_id TEXT
);

CREATE TABLE IF NOT EXISTS link_filter_bypass_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  role_id TEXT
);

CREATE TABLE IF NOT EXISTS link_filter_allowed_domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  domain TEXT
);

CREATE TABLE IF NOT EXISTS jailer_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  role_id TEXT
);

CREATE TABLE IF NOT EXISTS jail_state (
  guild_id TEXT,
  user_id TEXT,
  previous_roles TEXT,
  jailed_at INTEGER,
  PRIMARY KEY (guild_id, user_id)
);

CREATE TABLE IF NOT EXISTS jail_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  user_id TEXT,
  moderator_id TEXT,
  reason TEXT,
  action TEXT,
  timestamp INTEGER
);

CREATE TABLE IF NOT EXISTS warnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  user_id TEXT,
  moderator_id TEXT,
  reason TEXT,
  timestamp INTEGER
);

CREATE TABLE IF NOT EXISTS text_levels (
  guild_id TEXT,
  user_id TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 0,
  last_message_ts INTEGER DEFAULT 0,
  PRIMARY KEY (guild_id, user_id)
);

CREATE TABLE IF NOT EXISTS voice_levels (
  guild_id TEXT,
  user_id TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 0,
  PRIMARY KEY (guild_id, user_id)
);

CREATE TABLE IF NOT EXISTS voice_sessions (
  guild_id TEXT,
  user_id TEXT,
  join_ts INTEGER,
  PRIMARY KEY (guild_id, user_id)
);

CREATE TABLE IF NOT EXISTS filter_words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  word TEXT
);

CREATE TABLE IF NOT EXISTS shortcuts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  trigger_word TEXT,
  action TEXT
);

CREATE TABLE IF NOT EXISTS autoreplies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  trigger_word TEXT,
  response TEXT,
  exact_match INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS afk_users (
  guild_id TEXT,
  user_id TEXT,
  reason TEXT,
  timestamp INTEGER,
  PRIMARY KEY (guild_id, user_id)
);

CREATE TABLE IF NOT EXISTS giveaways (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  channel_id TEXT,
  message_id TEXT,
  prize TEXT,
  winners_count INTEGER,
  end_time INTEGER,
  host_id TEXT,
  ended INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  user_id TEXT,
  answers TEXT,
  status TEXT DEFAULT 'pending',
  timestamp INTEGER
);

CREATE TABLE IF NOT EXISTS saved_embeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  name TEXT,
  data TEXT
);
`);

// ترقية تلقائية: يضيف أي عمود ناقص لجدول guild_settings لو كانت قاعدة البيانات
// اتنشأت قبل إضافة عمود جديد بالكود (يمنع مشاكل "no such column" مستقبلاً)
function migrateGuildSettingsColumns() {
  const expectedColumns = {
    welcome_channel: 'TEXT', welcome_message: 'TEXT', welcome_title: 'TEXT',
    welcome_embed_color: "TEXT DEFAULT '#5865F2'", welcome_image: 'TEXT',
    welcome_thumbnail: 'TEXT', welcome_use_avatar_thumbnail: 'INTEGER DEFAULT 1',
    welcome_footer: 'TEXT', leave_channel: 'TEXT', leave_message: 'TEXT',
    leave_title: 'TEXT', leave_embed_color: "TEXT DEFAULT '#ED4245'", leave_image: 'TEXT',
    log_message: 'TEXT', log_reaction: 'TEXT', log_member: 'TEXT', log_voice: 'TEXT',
    log_ban: 'TEXT', log_kick: 'TEXT', log_unban: 'TEXT', log_mute: 'TEXT',
    log_unmute: 'TEXT', log_warn: 'TEXT', log_jail: 'TEXT',
    level_text_channel: 'TEXT', level_text_message: 'TEXT',
    level_voice_channel: 'TEXT', level_voice_message: 'TEXT',
    apply_channel: 'TEXT', apply_role: 'TEXT',
    filter_enabled: 'INTEGER DEFAULT 1', filter_action: "TEXT DEFAULT 'delete'",
    jail_enabled: 'INTEGER DEFAULT 0', jail_role: 'TEXT', jail_channel: 'TEXT',
    jail_hide_rooms: 'INTEGER DEFAULT 1', link_filter_enabled: 'INTEGER DEFAULT 0',
    trap_enabled: 'INTEGER DEFAULT 0', trap_channel: 'TEXT', trap_server_name: 'TEXT',
    trap_dm_message: 'TEXT', trap_contact: "TEXT DEFAULT '768a'",
  };

  const existing = db.prepare('PRAGMA table_info(guild_settings)').all().map(c => c.name);

  for (const [column, definition] of Object.entries(expectedColumns)) {
    if (!existing.includes(column)) {
      db.exec(`ALTER TABLE guild_settings ADD COLUMN ${column} ${definition}`);
      console.log(`[ترقية قاعدة البيانات] تمت إضافة عمود ناقص: ${column}`);
    }
  }
}

migrateGuildSettingsColumns();

function getGuildSettings(guildId) {
  let row = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId);
  if (!row) {
    db.prepare('INSERT INTO guild_settings (guild_id) VALUES (?)').run(guildId);
    row = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId);
  }
  return row;
}

function updateGuildSettings(guildId, fields) {
  getGuildSettings(guildId);
  const keys = Object.keys(fields);
  if (keys.length === 0) return;
  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => fields[k]);
  db.prepare(`UPDATE guild_settings SET ${setClause} WHERE guild_id = ?`).run(...values, guildId);
}

module.exports = { db, getGuildSettings, updateGuildSettings };
