const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const { db, getGuildSettings, updateGuildSettings } = require('./database');

function getCaseCount(guildId) {
  const row = db.prepare('SELECT COUNT(*) AS count FROM trap_cases WHERE guild_id = ?').get(guildId);
  return row.count;
}

function logTrapCase(guildId, userId) {
  db.prepare('INSERT INTO trap_cases (guild_id, user_id, timestamp) VALUES (?, ?, ?)').run(guildId, userId, Date.now());
}

function getLastCases(guildId, limit = 10) {
  return db.prepare('SELECT * FROM trap_cases WHERE guild_id = ? ORDER BY timestamp DESC LIMIT ?').all(guildId, limit);
}

function resetCases(guildId) {
  db.prepare('DELETE FROM trap_cases WHERE guild_id = ?').run(guildId);
}

function buildTrapPanelEmbed(guild) {
  const settings = getGuildSettings(guild.id);
  const count = getCaseCount(guild.id);

  return new EmbedBuilder()
    .setTitle('🛡️ نظام مكافحة رسائل النصب')
    .setColor(settings.trap_enabled ? '#57F287' : '#ED4245')
    .addFields(
      { name: 'الحالة', value: settings.trap_enabled ? 'مفعّل ✅' : 'معطّل ❌', inline: true },
      { name: 'قناة الفخ', value: settings.trap_channel ? `<#${settings.trap_channel}>` : 'غير محددة', inline: true },
      { name: 'اسم السيرفر بالرسالة', value: settings.trap_server_name || guild.name, inline: true },
      { name: 'جهة التواصل لفك الحظر', value: settings.trap_contact || '768a', inline: true },
      { name: 'عدد الحالات المسجلة', value: `${count}`, inline: true }
    );
}

function buildTrapPanelButtons() {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('trap_enable').setLabel('تفعيل').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('trap_disable').setLabel('إيقاف').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('trap_setchannel').setLabel('تحديد قناة الفخ').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('trap_reset').setLabel('إعادة ضبط').setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('trap_showcases').setLabel('عرض آخر 10 حالات').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('trap_setdm').setLabel('تغيير رسالة الـ DM').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('trap_setservername').setLabel('تغيير اسم السيرفر').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('trap_unban').setLabel('فك باند').setStyle(ButtonStyle.Secondary)
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('trap_setcontact').setLabel('تغيير جهة التواصل لفك الحظر').setStyle(ButtonStyle.Secondary)
  );

  return [row1, row2, row3];
}

async function handleTrapMessage(message) {
  const settings = getGuildSettings(message.guild.id);
  if (!settings.trap_enabled || !settings.trap_channel) return false;
  if (message.channel.id !== settings.trap_channel) return false;
  if (message.member.permissions.has('Administrator')) return false;

  await message.delete().catch(() => {});

  const serverName = settings.trap_server_name || message.guild.name;
  const contact = settings.trap_contact || '768a';
  const defaultDm = 'تم حظرك تلقائياً من سيرفر {server} بسبب اختراق حسابك وإرساله رسائل نصب (فخ) بدون علمك.\n\n🔒 يرجى تأمين حسابك فوراً: غيّر كلمة المرور، فعّل التحقق بخطوتين (2FA)، وراجع تطبيقات/بوتات مصرح لها بحسابك واحذف أي شي مشبوه.\n\n✅ بعد ما تنظف حسابك وتتأكد إنه آمن، راسل **{contact}** على ديسكورد عشان يفك حظرك.';
  const dmText = (settings.trap_dm_message || defaultDm)
    .replaceAll('{server}', serverName)
    .replaceAll('{contact}', contact);

  const dmEmbed = new EmbedBuilder()
    .setTitle('🚫 تم حظرك تلقائياً')
    .setDescription(dmText)
    .setColor('#ED4245');
  await message.author.send({ embeds: [dmEmbed] }).catch(() => {});

  await message.guild.members.ban(message.author.id, { reason: 'نظام الفخ: إرسال رسالة بقناة الفخ (نصب/حساب مخترق)' }).catch(() => {});

  logTrapCase(message.guild.id, message.author.id);

  return true;
}

module.exports = {
  getCaseCount,
  logTrapCase,
  getLastCases,
  resetCases,
  buildTrapPanelEmbed,
  buildTrapPanelButtons,
  handleTrapMessage,
};