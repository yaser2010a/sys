const { EmbedBuilder, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { db, getGuildSettings, updateGuildSettings } = require('../../utils/database');
const { addWord, removeWord, listWords, addBypassRole, removeBypassRole, listBypassRoles } = require('../../utils/filter');
const {
  addLinkBypassRole, removeLinkBypassRole, listLinkBypassRoles,
  addAllowedDomain, removeAllowedDomain, listAllowedDomains,
} = require('../../utils/linkFilter');
const {
  CONFIGURABLE_COMMANDS, addCommandRole, removeCommandRole, getAllCommandPermissions,
} = require('../../utils/permissions');
const {
  isCurrentlyJailed, jailMember, unjailMember, syncHideRooms,
  addJailerRole, removeJailerRole, listJailerRoles,
} = require('../../utils/jail');
const { banMember, kickMember, unbanMember } = require('../../utils/moderation');
const { endGiveaway, startGiveaway } = require('../../utils/giveawayManager');
const { sendDmToMembers } = require('../../utils/broadcast');
const { readRulesFile, writeRulesFile, listRuleKeys } = require('../../utils/rules');
const {
  buildTrapPanelEmbed, buildTrapPanelButtons, getLastCases, resetCases, getCaseCount,
} = require('../../utils/trapsystem');

module.exports = function registerApiRoutes(app, client, requireAuth) {
  function getGuild(req, res) {
    const guild = client.guilds.cache.get(req.params.id);
    if (!guild) {
      res.status(404).json({ error: 'ما لقيت السيرفر (تأكد إن البوت جوه ومتصل)' });
      return null;
    }
    return guild;
  }

  app.get('/api/guilds', requireAuth, (req, res) => {
    const guilds = [...client.guilds.cache.values()].map(g => ({
      id: g.id,
      name: g.name,
      icon: g.iconURL(),
      memberCount: g.memberCount,
    }));
    res.json(guilds);
  });

  app.get('/api/guild/:id/overview', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    res.json({
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL(),
      memberCount: guild.memberCount,
      settings: getGuildSettings(guild.id),
      botOnline: client.ws.status === 0,
    });
  });

  app.get('/api/guild/:id/channels', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const channels = guild.channels.cache
      .filter(c => c.type === ChannelType.GuildText || c.type === ChannelType.GuildVoice)
      .map(c => ({ id: c.id, name: c.name, type: c.type }));
    res.json(channels);
  });

  app.get('/api/guild/:id/roles', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const roles = guild.roles.cache
      .filter(r => r.id !== guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => ({ id: r.id, name: r.name, color: r.hexColor }));
    res.json(roles);
  });

  // ---------- الإعدادات العامة ----------
  app.get('/api/guild/:id/settings', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    res.json(getGuildSettings(guild.id));
  });

  app.post('/api/guild/:id/settings', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    updateGuildSettings(guild.id, req.body);
    res.json({ success: true });
  });

  // ---------- الفلتر ----------
  app.get('/api/guild/:id/filter-words', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    res.json(listWords(guild.id));
  });

  app.post('/api/guild/:id/filter-words', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    addWord(guild.id, req.body.word);
    res.json({ success: true });
  });

  app.delete('/api/guild/:id/filter-words/:word', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    removeWord(guild.id, req.params.word);
    res.json({ success: true });
  });

  app.get('/api/guild/:id/filter-bypass', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    res.json(listBypassRoles(guild.id));
  });

  app.post('/api/guild/:id/filter-bypass', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    addBypassRole(guild.id, req.body.roleId);
    res.json({ success: true });
  });

  app.delete('/api/guild/:id/filter-bypass/:roleId', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    removeBypassRole(guild.id, req.params.roleId);
    res.json({ success: true });
  });

  // ---------- فلتر الروابط ----------
  app.get('/api/guild/:id/link-filter', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    res.json({
      enabled: getGuildSettings(guild.id).link_filter_enabled,
      bypassRoles: listLinkBypassRoles(guild.id),
      allowedDomains: listAllowedDomains(guild.id),
    });
  });

  app.post('/api/guild/:id/link-filter/toggle', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    updateGuildSettings(guild.id, { link_filter_enabled: req.body.enabled ? 1 : 0 });
    res.json({ success: true });
  });

  app.post('/api/guild/:id/link-filter/bypass', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    addLinkBypassRole(guild.id, req.body.roleId);
    res.json({ success: true });
  });

  app.delete('/api/guild/:id/link-filter/bypass/:roleId', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    removeLinkBypassRole(guild.id, req.params.roleId);
    res.json({ success: true });
  });

  app.post('/api/guild/:id/link-filter/domains', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    addAllowedDomain(guild.id, req.body.domain.toLowerCase().trim());
    res.json({ success: true });
  });

  app.delete('/api/guild/:id/link-filter/domains/:domain', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    removeAllowedDomain(guild.id, req.params.domain);
    res.json({ success: true });
  });

  // ---------- صلاحيات الأوامر المخصصة ----------
  app.get('/api/guild/:id/command-permissions', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    res.json({
      commands: CONFIGURABLE_COMMANDS,
      assignments: getAllCommandPermissions(guild.id),
    });
  });

  app.post('/api/guild/:id/command-permissions', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const { commandName, roleId } = req.body;
    const added = addCommandRole(guild.id, commandName, roleId);
    res.json({ success: true, added });
  });

  app.delete('/api/guild/:id/command-permissions/:commandName/:roleId', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    removeCommandRole(guild.id, req.params.commandName, req.params.roleId);
    res.json({ success: true });
  });

  // ---------- الشورت كتس ----------
  app.get('/api/guild/:id/shortcuts', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    res.json(db.prepare('SELECT * FROM shortcuts WHERE guild_id = ?').all(guild.id));
  });

  app.post('/api/guild/:id/shortcuts', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const { trigger, action } = req.body;
    db.prepare('INSERT INTO shortcuts (guild_id, trigger_word, action) VALUES (?, ?, ?)').run(guild.id, trigger, action);
    res.json({ success: true });
  });

  app.delete('/api/guild/:id/shortcuts/:rowId', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    db.prepare('DELETE FROM shortcuts WHERE guild_id = ? AND id = ?').run(guild.id, req.params.rowId);
    res.json({ success: true });
  });

  // ---------- الأوتو ريبلاي ----------
  app.get('/api/guild/:id/autoreplies', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    res.json(db.prepare('SELECT * FROM autoreplies WHERE guild_id = ?').all(guild.id));
  });

  app.post('/api/guild/:id/autoreplies', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const { trigger, response, exactMatch } = req.body;
    db.prepare('INSERT INTO autoreplies (guild_id, trigger_word, response, exact_match) VALUES (?, ?, ?, ?)')
      .run(guild.id, trigger, response, exactMatch ? 1 : 0);
    res.json({ success: true });
  });

  app.delete('/api/guild/:id/autoreplies/:rowId', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    db.prepare('DELETE FROM autoreplies WHERE guild_id = ? AND id = ?').run(guild.id, req.params.rowId);
    res.json({ success: true });
  });

  // ---------- نظام السجن ----------
  app.get('/api/guild/:id/jail', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const settings = getGuildSettings(guild.id);
    const jailers = listJailerRoles(guild.id);
    const jailedUsers = db.prepare('SELECT * FROM jail_state WHERE guild_id = ?').all(guild.id);
    res.json({ settings, jailers, jailedUsers });
  });

  app.post('/api/guild/:id/jail/settings', requireAuth, async (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    updateGuildSettings(guild.id, req.body);
    if (req.body.jail_role || req.body.jail_hide_rooms !== undefined) {
      await syncHideRooms(guild);
    }
    res.json({ success: true });
  });

  app.post('/api/guild/:id/jail/jailers', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    addJailerRole(guild.id, req.body.roleId);
    res.json({ success: true });
  });

  app.delete('/api/guild/:id/jail/jailers/:roleId', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    removeJailerRole(guild.id, req.params.roleId);
    res.json({ success: true });
  });

  app.post('/api/guild/:id/jail/action', requireAuth, async (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const { userId, action, reason } = req.body;
    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return res.status(404).json({ error: 'ما لقيت العضو' });

    const moderator = { id: client.user.id };

    try {
      if (action === 'jail') {
        await jailMember({ guild, member, moderator, reason });
      } else if (action === 'unjail') {
        await unjailMember({ guild, member, moderator, reason, restorePreviousRoles: true });
      } else if (action === 'pardon') {
        await unjailMember({ guild, member, moderator, reason, restorePreviousRoles: false });
      }
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // ---------- الإدارة (بان/كيك/انبان) ----------
  app.post('/api/guild/:id/moderation/:action', requireAuth, async (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const { action } = req.params;
    const { userId, reason } = req.body;
    const moderator = { id: client.user.id };

    try {
      if (action === 'ban') {
        const user = await client.users.fetch(userId);
        await banMember({ guild, target: user, moderator, reason });
      } else if (action === 'kick') {
        const member = await guild.members.fetch(userId);
        await kickMember({ guild, target: member, moderator, reason });
      } else if (action === 'unban') {
        await unbanMember({ guild, targetId: userId, moderator, reason });
      }
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // ---------- التحذيرات ----------
  app.get('/api/guild/:id/warnings', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    res.json(db.prepare('SELECT * FROM warnings WHERE guild_id = ? ORDER BY timestamp DESC').all(guild.id));
  });

  app.delete('/api/guild/:id/warnings/:rowId', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    db.prepare('DELETE FROM warnings WHERE guild_id = ? AND id = ?').run(guild.id, req.params.rowId);
    res.json({ success: true });
  });

  // ---------- التقديمات ----------
  app.get('/api/guild/:id/applications', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const rows = db.prepare('SELECT * FROM applications WHERE guild_id = ? ORDER BY timestamp DESC').all(guild.id);
    res.json(rows.map(r => ({ ...r, answers: JSON.parse(r.answers) })));
  });

  app.post('/api/guild/:id/applications/:appId/:decision', requireAuth, async (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const { appId, decision } = req.params;

    const app_ = db.prepare('SELECT * FROM applications WHERE guild_id = ? AND id = ?').get(guild.id, appId);
    if (!app_) return res.status(404).json({ error: 'ما لقيت التقديم' });

    const status = decision === 'accept' ? 'accepted' : 'rejected';
    db.prepare('UPDATE applications SET status = ? WHERE id = ?').run(status, appId);

    const user = await client.users.fetch(app_.user_id).catch(() => null);
    if (user) {
      const embed = new EmbedBuilder()
        .setTitle(status === 'accepted' ? '✅ تم قبول تقديمك' : '❌ تم رفض تقديمك')
        .setDescription(`بخصوص تقديمك بسيرفر **${guild.name}**`)
        .setColor(status === 'accepted' ? '#57F287' : '#ED4245');
      await user.send({ embeds: [embed] }).catch(() => {});
    }

    if (status === 'accepted') {
      const settings = getGuildSettings(guild.id);
      if (settings.apply_role) {
        const member = await guild.members.fetch(app_.user_id).catch(() => null);
        if (member) await member.roles.add(settings.apply_role).catch(() => {});
      }
    }

    res.json({ success: true });
  });

  // ---------- القيف اواي ----------
  app.get('/api/guild/:id/giveaways', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    res.json(db.prepare('SELECT * FROM giveaways WHERE guild_id = ? ORDER BY id DESC').all(guild.id));
  });

  app.post('/api/guild/:id/giveaways/start', requireAuth, async (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const { channelId, prize, durationMs, winnersCount } = req.body;

    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return res.status(404).json({ error: 'ما لقيت القناة' });
    if (!prize || !durationMs || durationMs <= 0) return res.status(400).json({ error: 'بيانات القيف اواي غير مكتملة' });

    await startGiveaway({ channel, prize, durationMs, winnersCount: winnersCount || 1, hostId: null });
    res.json({ success: true });
  });

  app.post('/api/guild/:id/giveaways/:giveawayId/end', requireAuth, async (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const giveaway = db.prepare('SELECT * FROM giveaways WHERE guild_id = ? AND id = ?').get(guild.id, req.params.giveawayId);
    if (!giveaway) return res.status(404).json({ error: 'ما لقيت القيف اواي' });
    await endGiveaway(client, giveaway);
    res.json({ success: true });
  });

  // ---------- الايمبد والقول ----------
  app.post('/api/guild/:id/embed/send', requireAuth, async (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const { channelId, title, description, color, image, footer } = req.body;

    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return res.status(404).json({ error: 'ما لقيت القناة' });

    const embed = new EmbedBuilder().setDescription(description || '');
    if (title) embed.setTitle(title);
    if (footer) embed.setFooter({ text: footer });
    embed.setColor(/^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#5865F2');
    if (image && /^https?:\/\//.test(image)) embed.setImage(image);

    await channel.send({ embeds: [embed] });
    res.json({ success: true });
  });

  app.post('/api/guild/:id/say', requireAuth, async (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const { channelId, text } = req.body;
    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return res.status(404).json({ error: 'ما لقيت القناة' });
    await channel.send(text);
    res.json({ success: true });
  });

  // ---------- الإرسال الخاص الجماعي (البرودكاست الجديد) ----------
  app.post('/api/guild/:id/broadcast-dm', requireAuth, async (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const { title, message, target } = req.body;
    if (!message) return res.status(400).json({ error: 'لازم تكتب رسالة' });

    const result = await sendDmToMembers(guild, { title, message, target: target || 'all' });
    res.json({ success: true, ...result });
  });

  // ---------- نشر إعلان التقديم (زر تفاعلي) ----------
  app.post('/api/guild/:id/applications/post', requireAuth, async (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const settings = getGuildSettings(guild.id);

    if (!settings.apply_channel) return res.status(400).json({ error: 'حدد قناة التقديم أول' });

    const channel = await guild.channels.fetch(settings.apply_channel).catch(() => null);
    if (!channel) return res.status(404).json({ error: 'ما لقيت قناة التقديم' });

    const embed = new EmbedBuilder()
      .setTitle('📋 التقديم على الإدارة مفتوح!')
      .setDescription(req.body.description || 'اضغط الزر تحت عشان تقدّم على وظيفة إدارية بالسيرفر.')
      .setColor('#5865F2');

    const button = new ButtonBuilder()
      .setCustomId('open_apply_modal')
      .setLabel('قدّم الآن')
      .setEmoji('📝')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await channel.send({ embeds: [embed], components: [row] });
    res.json({ success: true });
  });

  // ---------- الليفلنق ----------
  app.get('/api/guild/:id/leaderboard/:type', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const table = req.params.type === 'voice' ? 'voice_levels' : 'text_levels';
    const rows = db.prepare(`SELECT * FROM ${table} WHERE guild_id = ? ORDER BY level DESC, xp DESC LIMIT 50`).all(guild.id);
    res.json(rows);
  });

  // ---------- القوانين ----------
  app.get('/api/guild/:id/rules', requireAuth, (req, res) => {
    const keys = listRuleKeys();
    const data = keys.map(k => ({ key: k.key, label: k.label, ...readRulesFile(k.key) }));
    res.json(data);
  });

  app.post('/api/guild/:id/rules/:key', requireAuth, (req, res) => {
    const ok = writeRulesFile(req.params.key, req.body.content || '');
    if (!ok) return res.status(400).json({ error: 'مفتاح غير معروف' });
    res.json({ success: true });
  });

  app.post('/api/guild/:id/rules-post', requireAuth, async (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const { channelId } = req.body;
    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return res.status(404).json({ error: 'ما لقيت القناة' });

    const { EmbedBuilder: EB, ActionRowBuilder: ARB, StringSelectMenuBuilder } = require('discord.js');
    const embed = new EB().setTitle('📋 قائمة القوانين').setDescription('اختر نوع القوانين من القائمة بالأسفل').setColor('#2b2d31');
    const menu = new StringSelectMenuBuilder().setCustomId('rules_select').setPlaceholder('اختر نوع القوانين')
      .addOptions(listRuleKeys().map(r => ({ label: r.label, value: r.key })));
    const row = new ARB().addComponents(menu);

    await channel.send({ embeds: [embed], components: [row] });
    res.json({ success: true });
  });

  // ---------- نظام الفخ ----------
  app.get('/api/guild/:id/trap', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const settings = getGuildSettings(guild.id);
    res.json({
      trap_enabled: settings.trap_enabled,
      trap_channel: settings.trap_channel,
      trap_server_name: settings.trap_server_name,
      trap_dm_message: settings.trap_dm_message,
      trap_contact: settings.trap_contact,
      caseCount: getCaseCount(guild.id),
      lastCases: getLastCases(guild.id, 10),
    });
  });

  app.post('/api/guild/:id/trap/settings', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    updateGuildSettings(guild.id, req.body);
    res.json({ success: true });
  });

  app.post('/api/guild/:id/trap/reset', requireAuth, (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    resetCases(guild.id);
    res.json({ success: true });
  });

  app.post('/api/guild/:id/trap/unban', requireAuth, async (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const userId = (req.body.userId || '').trim();

    if (!/^\d{17,20}$/.test(userId)) {
      return res.status(400).json({ error: `"${userId}" مو آيدي ديسكورد صحيح (لازم يكون أرقام بس)` });
    }

    try {
      await guild.members.unban(userId, 'فك حظر نظام الفخ (حالة خاطئة) - عبر الداشبورد');
      res.json({ success: true });
    } catch (err) {
      let reason = err.message;
      if (err.code === 10026) reason = 'هذا العضو مو محظور أصلاً (يمكن انفك حظره قبل كذا)';
      if (err.code === 50013) reason = 'البوت ما عنده صلاحية "Ban Members" بالسيرفر';
      res.status(400).json({ error: reason });
    }
  });

  app.post('/api/guild/:id/trap/post', requireAuth, async (req, res) => {
    const guild = getGuild(req, res);
    if (!guild) return;
    const { channelId } = req.body;
    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return res.status(404).json({ error: 'ما لقيت القناة' });

    const embed = buildTrapPanelEmbed(guild);
    const components = buildTrapPanelButtons();
    await channel.send({ embeds: [embed], components });
    res.json({ success: true });
  });
};
