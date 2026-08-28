const guildId = location.pathname.split('/guild/')[1];
let CHANNELS = [];
let ROLES = [];

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 401) {
    window.location.href = '/login';
    throw new Error('unauthorized');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'صار خطأ');
  return data;
}

function channelOptions(selectedId) {
  return '<option value="">— بدون —</option>' + CHANNELS
    .filter(c => c.type === 0)
    .map(c => `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>#${c.name}</option>`).join('');
}

function roleOptions(selectedId) {
  return '<option value="">— بدون —</option>' + ROLES
    .map(r => `<option value="${r.id}" ${r.id === selectedId ? 'selected' : ''}>${r.name}</option>`).join('');
}

function toast(msg, isError) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `position:fixed;bottom:20px;left:20px;background:${isError ? '#ed4245' : '#57f287'};color:#111;padding:12px 18px;border-radius:8px;z-index:999;font-weight:600;`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

const TABS = [
  { key: 'overview', label: '📊 نظرة عامة', render: renderOverview },
  { key: 'welcome', label: '👋 الترحيب والوداع', render: renderWelcome },
  { key: 'logs', label: '📜 اللوقز', render: renderLogs },
  { key: 'leveling', label: '📈 الليفلنق', render: renderLeveling },
  { key: 'filter', label: '🛡️ الفلتر والروابط', render: renderFilter },
  { key: 'permissions', label: '🔑 صلاحيات الأوامر', render: renderPermissions },
  { key: 'shortcuts', label: '⚡ الشورت كتس', render: renderShortcuts },
  { key: 'autoreply', label: '💬 الأوتو ريبلاي', render: renderAutoReply },
  { key: 'jail', label: '🔒 نظام السجن', render: renderJail },
  { key: 'rules', label: '📋 القوانين', render: renderRules },
  { key: 'trap', label: '🛡️ نظام الفخ', render: renderTrap },
  { key: 'moderation', label: '🔨 الإدارة والتحذيرات', render: renderModeration },
  { key: 'applications', label: '📝 تقديمات الإدارة', render: renderApplications },
  { key: 'giveaways', label: '🎉 القيف اواي', render: renderGiveaways },
  { key: 'tools', label: '🧰 أدوات (ايمبد / قول)', render: renderTools },
  { key: 'broadcast', label: '📢 إرسال للجميع', render: renderBroadcast },
];

function renderSidebar(active) {
  document.getElementById('sidebar').innerHTML = TABS.map(t =>
    `<button class="${t.key === active ? 'active' : ''}" onclick="switchTab('${t.key}')">${t.label}</button>`
  ).join('');
}

async function switchTab(key) {
  renderSidebar(key);
  const tab = TABS.find(t => t.key === key);
  const content = document.getElementById('content');
  content.innerHTML = '<div class="empty-state">جاري التحميل...</div>';
  try {
    await tab.render(content);
  } catch (err) {
    content.innerHTML = `<div class="card error-msg">صار خطأ: ${err.message}</div>`;
  }
}

// ---------------- نظرة عامة ----------------
async function renderOverview(content) {
  const overview = await api(`/api/guild/${guildId}/overview`);
  content.innerHTML = `
    <div class="card">
      <h3>معلومات السيرفر</h3>
      <p>👥 عدد الأعضاء: <strong>${overview.memberCount}</strong></p>
      <p>🤖 حالة البوت: <span class="badge">${overview.botOnline ? 'متصل ✅' : 'غير متصل ❌'}</span></p>
      <p>🆔 آيدي السيرفر: <code>${overview.id}</code></p>
    </div>
  `;
}

// ---------------- الترحيب والوداع ----------------
async function renderWelcome(content) {
  const settings = await api(`/api/guild/${guildId}/settings`);

  const roomButtons = CHANNELS.filter(c => c.type === 0)
    .map(c => `<button type="button" class="secondary" style="padding:4px 10px;font-size:12px;flex:0 0 auto;" onclick="insertRoomMention('welcomeMessage','${c.name}')">#${c.name}</button>`)
    .join(' ');

  const leaveRoomButtons = CHANNELS.filter(c => c.type === 0)
    .map(c => `<button type="button" class="secondary" style="padding:4px 10px;font-size:12px;flex:0 0 auto;" onclick="insertRoomMention('leaveMessage','${c.name}')">#${c.name}</button>`)
    .join(' ');

  content.innerHTML = `
    <div class="card">
      <h3>👋 إيمبد الترحيب</h3>
      <label>القناة</label>
      <select id="welcomeChannel">${channelOptions(settings.welcome_channel)}</select>

      <label>العنوان (اختياري)</label>
      <input id="welcomeTitle" value="${settings.welcome_title || ''}" placeholder="هلا فيك بالسيرفر!">

      <label>الوصف (متغيرات: {user} {username} {server} {membercount} — ومنشن روم بكتابة اسمه بين قوسين مثل (عام))</label>
      <textarea id="welcomeMessage" rows="4">${settings.welcome_message || ''}</textarea>
      <div class="row" style="margin-top:6px; flex-wrap:wrap;">
        <span style="color:var(--text-muted); font-size:12px; flex:0 0 auto;">إضافة منشن روم سريع:</span>
        ${roomButtons || '<span style="color:var(--text-muted); font-size:12px;">ما فيه رومات نصية</span>'}
      </div>

      <div class="row">
        <div>
          <label>لون الإيمبد</label>
          <input type="color" id="welcomeColor" value="${settings.welcome_embed_color || '#5865F2'}" style="height:42px; padding:4px;">
        </div>
        <div>
          <label>فوتر (نص أسفل الإيمبد)</label>
          <input id="welcomeFooter" value="${settings.welcome_footer || ''}" placeholder="مثال: وصلت لعائلتنا الكبيرة">
        </div>
      </div>

      <div class="toggle-row">
        <span>استخدام صورة العضو كثامبنيل تلقائياً</span>
        <label class="switch">
          <input type="checkbox" id="welcomeAvatarThumb" ${settings.welcome_use_avatar_thumbnail ? 'checked' : ''} onchange="toggleWelcomeThumbField()">
          <span class="slider"></span>
        </label>
      </div>

      <div id="welcomeThumbWrapper" style="${settings.welcome_use_avatar_thumbnail ? 'display:none;' : ''}">
        <label>رابط صورة ثامبنيل مخصصة (بدال صورة العضو)</label>
        <input id="welcomeThumbnail" value="${settings.welcome_thumbnail || ''}" placeholder="https://...">
      </div>

      <label>رابط صورة كبيرة بأسفل الإيمبد (بانر ترحيب مثلاً)</label>
      <input id="welcomeImage" value="${settings.welcome_image || ''}" placeholder="https://...">

      <button onclick="saveWelcome()" style="margin-top:14px;">💾 حفظ إيمبد الترحيب</button>
      <button class="secondary" onclick="previewWelcome()">👁️ معاينة</button>
      <div id="welcomePreview"></div>
    </div>

    <div class="card">
      <h3>👋 إيمبد الوداع</h3>
      <label>القناة</label>
      <select id="leaveChannel">${channelOptions(settings.leave_channel)}</select>

      <label>العنوان (اختياري)</label>
      <input id="leaveTitle" value="${settings.leave_title || ''}" placeholder="وداعاً!">

      <label>الوصف (متغيرات: {user} {username} {server} — ومنشن روم بقوسين مثل (عام))</label>
      <textarea id="leaveMessage" rows="3">${settings.leave_message || ''}</textarea>
      <div class="row" style="margin-top:6px; flex-wrap:wrap;">
        <span style="color:var(--text-muted); font-size:12px; flex:0 0 auto;">إضافة منشن روم سريع:</span>
        ${leaveRoomButtons || '<span style="color:var(--text-muted); font-size:12px;">ما فيه رومات نصية</span>'}
      </div>

      <div class="row">
        <div>
          <label>لون الإيمبد</label>
          <input type="color" id="leaveColor" value="${settings.leave_embed_color || '#ED4245'}" style="height:42px; padding:4px;">
        </div>
        <div>
          <label>رابط صورة كبيرة (اختياري)</label>
          <input id="leaveImage" value="${settings.leave_image || ''}" placeholder="https://...">
        </div>
      </div>

      <button onclick="saveLeave()">💾 حفظ إيمبد الوداع</button>
    </div>
  `;
}

function insertRoomMention(fieldId, roomName) {
  const field = document.getElementById(fieldId);
  const cursorPos = field.selectionStart ?? field.value.length;
  const insertText = `(${roomName})`;
  field.value = field.value.slice(0, cursorPos) + insertText + field.value.slice(cursorPos);
  field.focus();
}

function toggleWelcomeThumbField() {
  const useAvatar = document.getElementById('welcomeAvatarThumb').checked;
  document.getElementById('welcomeThumbWrapper').style.display = useAvatar ? 'none' : 'block';
}

function previewWelcome() {
  const title = document.getElementById('welcomeTitle').value;
  const desc = document.getElementById('welcomeMessage').value
    .replaceAll('{user}', '@أنت')
    .replaceAll('{username}', 'اسم_المستخدم')
    .replaceAll('{server}', 'اسم السيرفر')
    .replaceAll('{membercount}', '123')
    .replace(/\(#?([^)]+)\)/g, '<span style="color:#00aff4;">#$1</span>');
  const color = document.getElementById('welcomeColor').value;
  const image = document.getElementById('welcomeImage').value;
  const footer = document.getElementById('welcomeFooter').value;
  const useAvatar = document.getElementById('welcomeAvatarThumb').checked;
  const customThumb = document.getElementById('welcomeThumbnail').value;

  document.getElementById('welcomePreview').innerHTML = `
    <div style="border-right:4px solid ${color}; background:var(--bg-tertiary); border-radius:6px; padding:14px; margin-top:14px; display:flex; gap:12px;">
      <div style="flex:1;">
        ${title ? `<div style="font-weight:700; margin-bottom:6px;">${title}</div>` : ''}
        <div style="white-space:pre-wrap; font-size:14px;">${desc || '<span style="color:var(--text-muted)">(بدون وصف)</span>'}</div>
        ${image ? `<img src="${image}" style="max-width:100%; border-radius:6px; margin-top:10px;">` : ''}
        ${footer ? `<div style="color:var(--text-muted); font-size:12px; margin-top:10px;">${footer}</div>` : ''}
      </div>
      ${(useAvatar || customThumb) ? `<img src="${useAvatar ? 'https://cdn.discordapp.com/embed/avatars/0.png' : customThumb}" style="width:64px; height:64px; border-radius:50%; flex:0 0 auto;">` : ''}
    </div>
  `;
}

async function saveWelcome() {
  await api(`/api/guild/${guildId}/settings`, {
    method: 'POST',
    body: JSON.stringify({
      welcome_channel: document.getElementById('welcomeChannel').value || null,
      welcome_title: document.getElementById('welcomeTitle').value || null,
      welcome_message: document.getElementById('welcomeMessage').value,
      welcome_embed_color: document.getElementById('welcomeColor').value,
      welcome_footer: document.getElementById('welcomeFooter').value || null,
      welcome_use_avatar_thumbnail: document.getElementById('welcomeAvatarThumb').checked ? 1 : 0,
      welcome_thumbnail: document.getElementById('welcomeThumbnail').value || null,
      welcome_image: document.getElementById('welcomeImage').value || null,
    }),
  });
  toast('تم الحفظ ✅');
}

async function saveLeave() {
  await api(`/api/guild/${guildId}/settings`, {
    method: 'POST',
    body: JSON.stringify({
      leave_channel: document.getElementById('leaveChannel').value || null,
      leave_title: document.getElementById('leaveTitle').value || null,
      leave_message: document.getElementById('leaveMessage').value,
      leave_embed_color: document.getElementById('leaveColor').value,
      leave_image: document.getElementById('leaveImage').value || null,
    }),
  });
  toast('تم الحفظ ✅');
}

// ---------------- اللوقز ----------------
async function renderLogs(content) {
  const settings = await api(`/api/guild/${guildId}/settings`);
  const generalFields = [
    ['log_message', '📝 لوق الرسائل (حذف/تعديل)'],
    ['log_reaction', '💢 لوق الرياكتات المحذوفة'],
    ['log_member', '👥 لوق دخول/خروج الأعضاء'],
    ['log_voice', '🔊 لوق الرومات الصوتية'],
  ];
  const modFields = [
    ['log_ban', '🚫 لوق البان'],
    ['log_kick', '👢 لوق الكيك'],
    ['log_unban', '✅ لوق الانبان'],
    ['log_mute', '🔇 لوق الميوت'],
    ['log_unmute', '🔊 لوق الانميوت'],
    ['log_warn', '⚠️ لوق الوارن'],
    ['log_jail', '🔒 لوق السجن (سجن/فك/عفو)'],
  ];

  content.innerHTML = `
    <div class="card">
      <h3>📜 لوقز عامة</h3>
      ${generalFields.map(([key, label]) => `
        <label>${label}</label>
        <select id="${key}">${channelOptions(settings[key])}</select>
      `).join('')}
      <button onclick="saveLogs()" style="margin-top:14px;">حفظ لوقز عامة</button>
    </div>

    <div class="card">
      <h3>🔨 لوقز أوامر الإدارة (كل أمر بقناته الخاصة)</h3>
      <p style="color:var(--text-muted); font-size:13px;">تقدر تخلي كل أمر يسجل بروم مختلف تماماً عن الباقي</p>
      ${modFields.map(([key, label]) => `
        <label>${label}</label>
        <select id="${key}">${channelOptions(settings[key])}</select>
      `).join('')}
      <button onclick="saveModLogs()" style="margin-top:14px;">حفظ لوقز الإدارة</button>
    </div>
  `;
}

async function saveLogs() {
  const fields = ['log_message', 'log_reaction', 'log_member', 'log_voice'];
  const payload = {};
  fields.forEach(f => payload[f] = document.getElementById(f).value || null);
  await api(`/api/guild/${guildId}/settings`, { method: 'POST', body: JSON.stringify(payload) });
  toast('تم الحفظ ✅');
}

async function saveModLogs() {
  const fields = ['log_ban', 'log_kick', 'log_unban', 'log_mute', 'log_unmute', 'log_warn', 'log_jail'];
  const payload = {};
  fields.forEach(f => payload[f] = document.getElementById(f).value || null);
  await api(`/api/guild/${guildId}/settings`, { method: 'POST', body: JSON.stringify(payload) });
  toast('تم الحفظ ✅');
}

// ---------------- الليفلنق ----------------
async function renderLeveling(content) {
  const settings = await api(`/api/guild/${guildId}/settings`);
  content.innerHTML = `
    <div class="card">
      <h3>📈 ليفل أب الكتابة</h3>
      <label>قناة الإعلان</label>
      <select id="levelTextChannel">${channelOptions(settings.level_text_channel)}</select>
      <label>الرسالة (متغيرات: {user} {level})</label>
      <textarea id="levelTextMessage" rows="2">${settings.level_text_message || ''}</textarea>
      <button onclick="saveTextLevel()">حفظ</button>
    </div>
    <div class="card">
      <h3>🎙️ ليفل أب الصوت</h3>
      <label>قناة الإعلان</label>
      <select id="levelVoiceChannel">${channelOptions(settings.level_voice_channel)}</select>
      <label>الرسالة (متغيرات: {user} {level})</label>
      <textarea id="levelVoiceMessage" rows="2">${settings.level_voice_message || ''}</textarea>
      <button onclick="saveVoiceLevel()">حفظ</button>
    </div>
    <div class="card">
      <h3>🏆 المتصدرين</h3>
      <div class="row">
        <button onclick="loadLeaderboard('text')">عرض الكتابي</button>
        <button onclick="loadLeaderboard('voice')">عرض الصوتي</button>
      </div>
      <div id="leaderboardResult"></div>
    </div>
  `;
}

async function saveTextLevel() {
  await api(`/api/guild/${guildId}/settings`, {
    method: 'POST',
    body: JSON.stringify({
      level_text_channel: document.getElementById('levelTextChannel').value || null,
      level_text_message: document.getElementById('levelTextMessage').value,
    }),
  });
  toast('تم الحفظ ✅');
}

async function saveVoiceLevel() {
  await api(`/api/guild/${guildId}/settings`, {
    method: 'POST',
    body: JSON.stringify({
      level_voice_channel: document.getElementById('levelVoiceChannel').value || null,
      level_voice_message: document.getElementById('levelVoiceMessage').value,
    }),
  });
  toast('تم الحفظ ✅');
}

async function loadLeaderboard(type) {
  const rows = await api(`/api/guild/${guildId}/leaderboard/${type}`);
  const el = document.getElementById('leaderboardResult');
  if (rows.length === 0) return el.innerHTML = '<div class="empty-state">ما فيه بيانات</div>';
  el.innerHTML = `<table><tr><th>#</th><th>آيدي العضو</th><th>المستوى</th><th>XP</th></tr>
    ${rows.map((r, i) => `<tr><td>${i + 1}</td><td>${r.user_id}</td><td>${r.level}</td><td>${r.xp}</td></tr>`).join('')}
  </table>`;
}

// ---------------- الفلتر والروابط ----------------
async function renderFilter(content) {
  const settings = await api(`/api/guild/${guildId}/settings`);
  const words = await api(`/api/guild/${guildId}/filter-words`);
  const bypassRoles = await api(`/api/guild/${guildId}/filter-bypass`);
  const linkFilter = await api(`/api/guild/${guildId}/link-filter`);

  content.innerHTML = `
    <div class="card">
      <h3>🛡️ فلتر السب والقذف</h3>
      <div class="toggle-row">
        <span>تفعيل الفلتر</span>
        <label class="switch">
          <input type="checkbox" id="filterEnabled" ${settings.filter_enabled ? 'checked' : ''} onchange="toggleFilter()">
          <span class="slider"></span>
        </label>
      </div>
      <label>إضافة كلمة محظورة</label>
      <div class="row">
        <input id="newWord" placeholder="الكلمة">
        <button onclick="addFilterWord()" style="flex:0 0 auto;">إضافة</button>
      </div>
      <div class="pill-list" id="wordsList">
        ${words.map(w => `<div class="pill">${w.word} <button onclick="removeFilterWord('${w.word}')">✕</button></div>`).join('') || '<span style="color:var(--text-muted)">ما فيه كلمات مضافة يدوياً</span>'}
      </div>

      <label style="margin-top:18px;">رتب تتخطى فلتر السب (بالإضافة لمن عنده صلاحية Manage Messages)</label>
      <div class="row">
        <select id="newFilterBypassRole">${roleOptions()}</select>
        <button onclick="addFilterBypass()" style="flex:0 0 auto;">إضافة</button>
      </div>
      <div class="pill-list">
        ${bypassRoles.map(r => `<div class="pill">${roleName(r.role_id)} <button onclick="removeFilterBypass('${r.role_id}')">✕</button></div>`).join('') || '<span style="color:var(--text-muted)">ما فيه رتب تتخطى الفلتر</span>'}
      </div>
    </div>

    <div class="card">
      <h3>🔗 فلتر الروابط</h3>
      <div class="toggle-row">
        <span>تفعيل فلتر الروابط</span>
        <label class="switch">
          <input type="checkbox" id="linkFilterEnabled" ${linkFilter.enabled ? 'checked' : ''} onchange="toggleLinkFilter()">
          <span class="slider"></span>
        </label>
      </div>

      <label>النطاقات المسموحة (لو تركتها فاضية، كل الروابط بتنحذف)</label>
      <div class="row">
        <input id="newDomain" placeholder="مثال: youtube.com">
        <button onclick="addDomain()" style="flex:0 0 auto;">إضافة</button>
      </div>
      <div class="pill-list">
        ${linkFilter.allowedDomains.map(d => `<div class="pill">${d.domain} <button onclick="removeDomain('${d.domain}')">✕</button></div>`).join('') || '<span style="color:var(--text-muted)">ما فيه نطاقات مسموحة (كل الروابط ممنوعة)</span>'}
      </div>

      <label style="margin-top:18px;">رتب تتخطى فلتر الروابط</label>
      <div class="row">
        <select id="newLinkBypassRole">${roleOptions()}</select>
        <button onclick="addLinkBypass()" style="flex:0 0 auto;">إضافة</button>
      </div>
      <div class="pill-list">
        ${linkFilter.bypassRoles.map(r => `<div class="pill">${roleName(r.role_id)} <button onclick="removeLinkBypass('${r.role_id}')">✕</button></div>`).join('') || '<span style="color:var(--text-muted)">ما فيه رتب تتخطى فلتر الروابط</span>'}
      </div>
    </div>
  `;
}

async function toggleFilter() {
  const checked = document.getElementById('filterEnabled').checked;
  await api(`/api/guild/${guildId}/settings`, { method: 'POST', body: JSON.stringify({ filter_enabled: checked ? 1 : 0 }) });
  toast('تم التحديث ✅');
}

async function addFilterWord() {
  const word = document.getElementById('newWord').value.trim();
  if (!word) return;
  await api(`/api/guild/${guildId}/filter-words`, { method: 'POST', body: JSON.stringify({ word }) });
  switchTab('filter');
}

async function removeFilterWord(word) {
  await api(`/api/guild/${guildId}/filter-words/${encodeURIComponent(word)}`, { method: 'DELETE' });
  switchTab('filter');
}

async function addFilterBypass() {
  const roleId = document.getElementById('newFilterBypassRole').value;
  if (!roleId) return;
  await api(`/api/guild/${guildId}/filter-bypass`, { method: 'POST', body: JSON.stringify({ roleId }) });
  switchTab('filter');
}

async function removeFilterBypass(roleId) {
  await api(`/api/guild/${guildId}/filter-bypass/${roleId}`, { method: 'DELETE' });
  switchTab('filter');
}

async function toggleLinkFilter() {
  const checked = document.getElementById('linkFilterEnabled').checked;
  await api(`/api/guild/${guildId}/link-filter/toggle`, { method: 'POST', body: JSON.stringify({ enabled: checked }) });
  toast('تم التحديث ✅');
}

async function addDomain() {
  const domain = document.getElementById('newDomain').value.trim();
  if (!domain) return;
  await api(`/api/guild/${guildId}/link-filter/domains`, { method: 'POST', body: JSON.stringify({ domain }) });
  switchTab('filter');
}

async function removeDomain(domain) {
  await api(`/api/guild/${guildId}/link-filter/domains/${encodeURIComponent(domain)}`, { method: 'DELETE' });
  switchTab('filter');
}

async function addLinkBypass() {
  const roleId = document.getElementById('newLinkBypassRole').value;
  if (!roleId) return;
  await api(`/api/guild/${guildId}/link-filter/bypass`, { method: 'POST', body: JSON.stringify({ roleId }) });
  switchTab('filter');
}

async function removeLinkBypass(roleId) {
  await api(`/api/guild/${guildId}/link-filter/bypass/${roleId}`, { method: 'DELETE' });
  switchTab('filter');
}

// ---------------- صلاحيات الأوامر ----------------
async function renderPermissions(content, selectedCommand) {
  const { commands, assignments } = await api(`/api/guild/${guildId}/command-permissions`);

  content.innerHTML = `
    <div class="card">
      <h3>🔑 صلاحيات الأوامر المخصصة</h3>
      <p style="color:var(--text-muted); font-size:13px;">
        حدد رتب إضافية تقدر تستخدم أوامر معينة، بغض النظر عن صلاحيات ديسكورد الافتراضية (الأدمن دايماً عنده وصول لكل شي).
      </p>
      <div class="row">
        <select id="permCommand">${commands.map(c => `<option value="${c.name}" ${c.name === selectedCommand ? 'selected' : ''}>${c.label}</option>`).join('')}</select>
        <select id="permRole">${roleOptions()}</select>
        <button onclick="addCommandPermission()" style="flex:0 0 auto;">إضافة</button>
      </div>
    </div>

    ${commands.map(c => {
      const roles = assignments.filter(a => a.command_name === c.name);
      return `
        <div class="card">
          <h3>${c.label}</h3>
          <div class="pill-list">
            ${roles.map(r => `<div class="pill">${roleName(r.role_id)} <button onclick="removeCommandPermission('${c.name}','${r.role_id}')">✕</button></div>`).join('') || '<span style="color:var(--text-muted)">ما فيه رتب إضافية (فقط الأدمن والصلاحية الافتراضية)</span>'}
          </div>
        </div>
      `;
    }).join('')}
  `;
}

async function addCommandPermission() {
  const commandName = document.getElementById('permCommand').value;
  const roleId = document.getElementById('permRole').value;
  if (!roleId) return toast('اختر رتبة', true);
  await api(`/api/guild/${guildId}/command-permissions`, { method: 'POST', body: JSON.stringify({ commandName, roleId }) });
  toast('تم الحفظ ✅');
  await renderPermissions(document.getElementById('content'), commandName);
}

async function removeCommandPermission(commandName, roleId) {
  await api(`/api/guild/${guildId}/command-permissions/${commandName}/${roleId}`, { method: 'DELETE' });
  await renderPermissions(document.getElementById('content'), commandName);
}

// ---------------- الشورت كتس ----------------
async function renderShortcuts(content) {
  const rows = await api(`/api/guild/${guildId}/shortcuts`);
  content.innerHTML = `
    <div class="card">
      <h3>⚡ إضافة اختصار جديد</h3>
      <p style="color:var(--text-muted); font-size:13px;">مثال: تكتب "تفو" + منشن عضو → يتحظر تلقائياً</p>
      <div class="row">
        <input id="shortcutTrigger" placeholder="الكلمة (مثال: تفو)">
        <select id="shortcutAction">
          <option value="بان">بان</option>
          <option value="كيك">كيك</option>
          <option value="ميوت">ميوت</option>
          <option value="وارن">وارن</option>
          <option value="سجن">سجن</option>
        </select>
        <button onclick="addShortcut()" style="flex:0 0 auto;">إضافة</button>
      </div>
    </div>
    <div class="card">
      <h3>القائمة الحالية</h3>
      ${rows.length === 0 ? '<div class="empty-state">ما فيه اختصارات</div>' : `
        <table><tr><th>الكلمة</th><th>الأمر</th><th></th></tr>
        ${rows.map(r => `<tr><td>${r.trigger_word}</td><td>${r.action}</td><td><button class="danger" onclick="deleteShortcut(${r.id})">حذف</button></td></tr>`).join('')}
        </table>
      `}
    </div>
  `;
}

async function addShortcut() {
  const trigger = document.getElementById('shortcutTrigger').value.trim();
  const action = document.getElementById('shortcutAction').value;
  if (!trigger) return;
  await api(`/api/guild/${guildId}/shortcuts`, { method: 'POST', body: JSON.stringify({ trigger, action }) });
  switchTab('shortcuts');
}

async function deleteShortcut(id) {
  await api(`/api/guild/${guildId}/shortcuts/${id}`, { method: 'DELETE' });
  switchTab('shortcuts');
}

// ---------------- الأوتو ريبلاي ----------------
async function renderAutoReply(content) {
  const rows = await api(`/api/guild/${guildId}/autoreplies`);
  content.innerHTML = `
    <div class="card">
      <h3>💬 إضافة رد تلقائي</h3>
      <div class="row">
        <input id="arTrigger" placeholder="الكلمة المفتاحية">
        <input id="arResponse" placeholder="الرد">
      </div>
      <label><input type="checkbox" id="arExact" style="width:auto;"> تطابق تام فقط</label>
      <button onclick="addAutoReply()">إضافة</button>
    </div>
    <div class="card">
      <h3>القائمة الحالية</h3>
      ${rows.length === 0 ? '<div class="empty-state">ما فيه ردود تلقائية</div>' : `
        <table><tr><th>الكلمة</th><th>الرد</th><th></th></tr>
        ${rows.map(r => `<tr><td>${r.trigger_word}</td><td>${r.response}</td><td><button class="danger" onclick="deleteAutoReply(${r.id})">حذف</button></td></tr>`).join('')}
        </table>
      `}
    </div>
  `;
}

async function addAutoReply() {
  const trigger = document.getElementById('arTrigger').value.trim();
  const response = document.getElementById('arResponse').value.trim();
  const exactMatch = document.getElementById('arExact').checked;
  if (!trigger || !response) return;
  await api(`/api/guild/${guildId}/autoreplies`, { method: 'POST', body: JSON.stringify({ trigger, response, exactMatch }) });
  switchTab('autoreply');
}

async function deleteAutoReply(id) {
  await api(`/api/guild/${guildId}/autoreplies/${id}`, { method: 'DELETE' });
  switchTab('autoreply');
}

// ---------------- نظام السجن ----------------
async function renderJail(content) {
  const data = await api(`/api/guild/${guildId}/jail`);
  const { settings, jailers, jailedUsers } = data;

  content.innerHTML = `
    <div class="card">
      <h3>🔒 إعدادات نظام السجن</h3>
      <div class="toggle-row">
        <span>تفعيل النظام</span>
        <label class="switch">
          <input type="checkbox" id="jailEnabled" ${settings.jail_enabled ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
      <div class="toggle-row">
        <span>إخفاء كل الرومات عن المسجون</span>
        <label class="switch">
          <input type="checkbox" id="jailHideRooms" ${settings.jail_hide_rooms ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
      <label>رتبة السجين</label>
      <select id="jailRole">${roleOptions(settings.jail_role)}</select>
      <label>قناة السجن</label>
      <select id="jailChannel">${channelOptions(settings.jail_channel)}</select>
      <button onclick="saveJailSettings()" style="margin-top:14px;">حفظ ومزامنة الإخفاء</button>
    </div>

    <div class="card">
      <h3>🛡️ رتب السجانين (يقدرون يستخدمون أوامر السجن)</h3>
      <div class="row">
        <select id="newJailerRole">${roleOptions()}</select>
        <button onclick="addJailer()" style="flex:0 0 auto;">إضافة</button>
      </div>
      <div class="pill-list">
        ${jailers.map(j => `<div class="pill">${roleName(j.role_id)} <button onclick="removeJailer('${j.role_id}')">✕</button></div>`).join('') || '<span style="color:var(--text-muted)">ما فيه رتب سجانين (فقط الأدمن)</span>'}
      </div>
    </div>

    <div class="card">
      <h3>👤 إجراء سريع على عضو</h3>
      <div class="row">
        <input id="jailUserId" placeholder="آيدي العضو">
        <input id="jailReason" placeholder="السبب (اختياري)">
      </div>
      <div class="row">
        <button onclick="jailAction('jail')">سجن</button>
        <button onclick="jailAction('unjail')">فك السجن (إرجاع الرتب)</button>
        <button class="secondary" onclick="jailAction('pardon')">عفو (بدون إرجاع)</button>
      </div>
    </div>

    <div class="card">
      <h3>📋 المسجونين حالياً</h3>
      ${jailedUsers.length === 0 ? '<div class="empty-state">ما فيه مسجونين حالياً</div>' : `
        <table><tr><th>آيدي العضو</th><th>وقت السجن</th></tr>
        ${jailedUsers.map(j => `<tr><td>${j.user_id}</td><td>${new Date(j.jailed_at).toLocaleString('ar')}</td></tr>`).join('')}
        </table>
      `}
    </div>
  `;
}

function roleName(id) {
  const role = ROLES.find(r => r.id === id);
  return role ? role.name : id;
}

async function saveJailSettings() {
  await api(`/api/guild/${guildId}/jail/settings`, {
    method: 'POST',
    body: JSON.stringify({
      jail_enabled: document.getElementById('jailEnabled').checked ? 1 : 0,
      jail_hide_rooms: document.getElementById('jailHideRooms').checked ? 1 : 0,
      jail_role: document.getElementById('jailRole').value || null,
      jail_channel: document.getElementById('jailChannel').value || null,
    }),
  });
  toast('تم الحفظ والمزامنة ✅');
  switchTab('jail');
}

async function addJailer() {
  const roleId = document.getElementById('newJailerRole').value;
  if (!roleId) return;
  await api(`/api/guild/${guildId}/jail/jailers`, { method: 'POST', body: JSON.stringify({ roleId }) });
  switchTab('jail');
}

async function removeJailer(roleId) {
  await api(`/api/guild/${guildId}/jail/jailers/${roleId}`, { method: 'DELETE' });
  switchTab('jail');
}

async function jailAction(action) {
  const userId = document.getElementById('jailUserId').value.trim();
  const reason = document.getElementById('jailReason').value.trim();
  if (!userId) return toast('حط آيدي العضو', true);
  try {
    await api(`/api/guild/${guildId}/jail/action`, { method: 'POST', body: JSON.stringify({ userId, action, reason }) });
    toast('تم تنفيذ الإجراء ✅');
    switchTab('jail');
  } catch (err) {
    toast(err.message, true);
  }
}

// ---------------- القوانين ----------------
async function renderRules(content) {
  const rules = await api(`/api/guild/${guildId}/rules`);

  content.innerHTML = `
    <div class="card">
      <h3>📢 نشر لوحة القوانين</h3>
      <p style="color:var(--text-muted); font-size:13px;">ينشر رسالة فيها قائمة منسدلة بخيارين: "قوانين السيرفر" و"قوانين الإدارة". أي عضو يختار وحد يشوف محتواه بالخاص.</p>
      <label>القناة</label>
      <select id="rulesPostChannel">${channelOptions()}</select>
      <button onclick="postRulesPanel()">نشر اللوحة</button>
    </div>

    ${rules.map(r => `
      <div class="card">
        <h3>✏️ ${r.label}</h3>
        <p style="color:var(--text-muted); font-size:12px;">يقرأ وينكتب مباشرة بملف <code>data/${r.key === 'admin' ? 'text1.txt' : 'text2.txt'}</code></p>
        <textarea id="rulesText_${r.key}" rows="10">${escapeHtml(r.content)}</textarea>
        <button onclick="saveRulesText('${r.key}')">حفظ ${r.label}</button>
      </div>
    `).join('')}
  `;
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function saveRulesText(key) {
  const content = document.getElementById(`rulesText_${key}`).value;
  await api(`/api/guild/${guildId}/rules/${key}`, { method: 'POST', body: JSON.stringify({ content }) });
  toast('تم الحفظ ✅');
}

async function postRulesPanel() {
  const channelId = document.getElementById('rulesPostChannel').value;
  if (!channelId) return toast('اختر قناة', true);
  try {
    await api(`/api/guild/${guildId}/rules-post`, { method: 'POST', body: JSON.stringify({ channelId }) });
    toast('تم نشر لوحة القوانين ✅');
  } catch (err) {
    toast(err.message, true);
  }
}

// ---------------- نظام الفخ ----------------
async function renderTrap(content) {
  const trap = await api(`/api/guild/${guildId}/trap`);

  content.innerHTML = `
    <div class="card">
      <h3>🛡️ إعدادات نظام مكافحة رسائل النصب</h3>
      <p style="color:var(--text-muted); font-size:13px;">أي حساب يرسل رسالة بقناة الفخ ينحظر تلقائياً فوراً (يفترض إنه حساب مخترق أو بوت نصب).</p>

      <div class="toggle-row">
        <span>تفعيل النظام</span>
        <label class="switch">
          <input type="checkbox" id="trapEnabled" ${trap.trap_enabled ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>

      <label>قناة الفخ (يفضّل تكون مخفية عن الأعضاء العاديين)</label>
      <select id="trapChannel">${channelOptions(trap.trap_channel)}</select>

      <label>اسم السيرفر بالرسالة</label>
      <input id="trapServerName" value="${trap.trap_server_name || ''}" placeholder="اسم السيرفر الافتراضي">

      <label>جهة التواصل لفك الحظر</label>
      <input id="trapContact" value="${trap.trap_contact || '768a'}" placeholder="768a">

      <label>نص رسالة الخاص (استخدم {server} و {contact})</label>
      <textarea id="trapDmMessage" rows="4">${escapeHtml(trap.trap_dm_message || '')}</textarea>

      <button onclick="saveTrapSettings()" style="margin-top:14px;">💾 حفظ الإعدادات</button>
    </div>

    <div class="card">
      <h3>📢 نشر لوحة التحكم بديسكورد</h3>
      <p style="color:var(--text-muted); font-size:13px;">ينشر لوحة بأزرار (تفعيل/إيقاف/تحديد قناة/...) تقدر تتحكم فيها مباشرة من ديسكورد كمان.</p>
      <label>القناة</label>
      <select id="trapPostChannel">${channelOptions()}</select>
      <button onclick="postTrapPanel()">نشر اللوحة</button>
    </div>

    <div class="card">
      <h3>🚨 فك حظر (حالة خاطئة)</h3>
      <div class="row">
        <input id="trapUnbanUserId" placeholder="آيدي العضو">
        <button class="danger" onclick="trapUnban()" style="flex:0 0 auto;">فك الحظر</button>
      </div>
    </div>

    <div class="card">
      <h3>📋 آخر الحالات (${trap.caseCount} حالة مسجلة)</h3>
      <button class="secondary" onclick="resetTrapCases()">إعادة ضبط العداد</button>
      ${trap.lastCases.length === 0 ? '<div class="empty-state">ما فيه حالات مسجلة</div>' : `
        <table><tr><th>آيدي العضو</th><th>الوقت</th></tr>
        ${trap.lastCases.map(c => `<tr><td>${c.user_id}</td><td>${new Date(c.timestamp).toLocaleString('ar')}</td></tr>`).join('')}
        </table>
      `}
    </div>
  `;
}

async function saveTrapSettings() {
  await api(`/api/guild/${guildId}/trap/settings`, {
    method: 'POST',
    body: JSON.stringify({
      trap_enabled: document.getElementById('trapEnabled').checked ? 1 : 0,
      trap_channel: document.getElementById('trapChannel').value || null,
      trap_server_name: document.getElementById('trapServerName').value || null,
      trap_contact: document.getElementById('trapContact').value || '768a',
      trap_dm_message: document.getElementById('trapDmMessage').value || null,
    }),
  });
  toast('تم الحفظ ✅');
}

async function postTrapPanel() {
  const channelId = document.getElementById('trapPostChannel').value;
  if (!channelId) return toast('اختر قناة', true);
  try {
    await api(`/api/guild/${guildId}/trap/post`, { method: 'POST', body: JSON.stringify({ channelId }) });
    toast('تم نشر اللوحة ✅');
  } catch (err) {
    toast(err.message, true);
  }
}

async function trapUnban() {
  const userId = document.getElementById('trapUnbanUserId').value.trim();
  if (!userId) return toast('حط آيدي العضو', true);
  try {
    await api(`/api/guild/${guildId}/trap/unban`, { method: 'POST', body: JSON.stringify({ userId }) });
    toast('تم فك الحظر ✅');
  } catch (err) {
    toast(err.message, true);
  }
}

async function resetTrapCases() {
  await api(`/api/guild/${guildId}/trap/reset`, { method: 'POST' });
  toast('تم تصفير العداد ✅');
  switchTab('trap');
}

// ---------------- الإدارة والتحذيرات ----------------
async function renderModeration(content) {
  const warnings = await api(`/api/guild/${guildId}/warnings`);
  content.innerHTML = `
    <div class="card">
      <h3>🔨 إجراء سريع</h3>
      <div class="row">
        <input id="modUserId" placeholder="آيدي العضو">
        <input id="modReason" placeholder="السبب (اختياري)">
      </div>
      <div class="row">
        <button class="danger" onclick="modAction('ban')">بان</button>
        <button class="danger" onclick="modAction('kick')">كيك</button>
        <button class="secondary" onclick="modAction('unban')">انبان</button>
      </div>
    </div>
    <div class="card">
      <h3>⚠️ كل التحذيرات بالسيرفر</h3>
      ${warnings.length === 0 ? '<div class="empty-state">ما فيه تحذيرات</div>' : `
        <table><tr><th>العضو</th><th>السبب</th><th>بواسطة</th><th></th></tr>
        ${warnings.map(w => `<tr><td>${w.user_id}</td><td>${w.reason}</td><td>${w.moderator_id}</td><td><button class="danger" onclick="deleteWarning(${w.id})">حذف</button></td></tr>`).join('')}
        </table>
      `}
    </div>
  `;
}

async function modAction(action) {
  const userId = document.getElementById('modUserId').value.trim();
  const reason = document.getElementById('modReason').value.trim();
  if (!userId) return toast('حط آيدي العضو', true);
  try {
    await api(`/api/guild/${guildId}/moderation/${action}`, { method: 'POST', body: JSON.stringify({ userId, reason }) });
    toast('تم تنفيذ الإجراء ✅');
  } catch (err) {
    toast(err.message, true);
  }
}

async function deleteWarning(id) {
  await api(`/api/guild/${guildId}/warnings/${id}`, { method: 'DELETE' });
  switchTab('moderation');
}

// ---------------- التقديمات ----------------
async function renderApplications(content) {
  const settings = await api(`/api/guild/${guildId}/settings`);
  const apps = await api(`/api/guild/${guildId}/applications`);

  content.innerHTML = `
    <div class="card">
      <h3>⚙️ إعدادات التقديم</h3>
      <label>قناة استلام التقديمات</label>
      <select id="applyChannel">${channelOptions(settings.apply_channel)}</select>
      <label>رتبة القبول (اختياري، تنعطى تلقائياً عند القبول)</label>
      <select id="applyRole">${roleOptions(settings.apply_role)}</select>
      <button onclick="saveApplySettings()">حفظ الإعدادات</button>
    </div>

    <div class="card">
      <h3>📢 إضافة تقديم (نشر زر تقديم بالقناة)</h3>
      <p style="color:var(--text-muted); font-size:13px;">ينشر رسالة فيها زر "قدّم الآن"، أي عضو يضغطه تفتح له استمارة تقديم مباشرة.</p>
      <label>وصف مخصص (اختياري)</label>
      <textarea id="applyPostDescription" rows="2" placeholder="اضغط الزر تحت عشان تقدّم على وظيفة إدارية بالسيرفر."></textarea>
      <button onclick="postApplyAnnouncement()">نشر إعلان التقديم</button>
    </div>

    <div class="card">
      <h3>📋 التقديمات الحالية</h3>
      ${apps.length === 0 ? '<div class="empty-state">ما فيه تقديمات</div>' : apps.map(a => `
        <div class="card" style="background:var(--bg-tertiary);">
          <p><strong>المتقدم:</strong> <@${a.user_id}> (${a.user_id}) | <span class="badge">${a.status === 'pending' ? 'قيد الانتظار' : a.status === 'accepted' ? 'مقبول ✅' : 'مرفوض ❌'}</span></p>
          <p><strong>العمر:</strong> ${a.answers.age} | <strong>التواجد اليومي:</strong> ${a.answers.hours}</p>
          <p><strong>الخبرة:</strong> ${a.answers.experience}</p>
          <p><strong>السبب:</strong> ${a.answers.reason}</p>
          ${a.status === 'pending' ? `
            <div class="row">
              <button onclick="decideApplication(${a.id}, 'accept')">قبول</button>
              <button class="danger" onclick="decideApplication(${a.id}, 'reject')">رفض</button>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

async function saveApplySettings() {
  await api(`/api/guild/${guildId}/settings`, {
    method: 'POST',
    body: JSON.stringify({
      apply_channel: document.getElementById('applyChannel').value || null,
      apply_role: document.getElementById('applyRole').value || null,
    }),
  });
  toast('تم الحفظ ✅');
}

async function postApplyAnnouncement() {
  try {
    await api(`/api/guild/${guildId}/applications/post`, {
      method: 'POST',
      body: JSON.stringify({ description: document.getElementById('applyPostDescription').value.trim() }),
    });
    toast('تم نشر إعلان التقديم ✅');
  } catch (err) {
    toast(err.message, true);
  }
}

async function decideApplication(id, decision) {
  await api(`/api/guild/${guildId}/applications/${id}/${decision}`, { method: 'POST' });
  switchTab('applications');
}

// ---------------- القيف اواي ----------------
async function renderGiveaways(content) {
  const giveaways = await api(`/api/guild/${guildId}/giveaways`);
  content.innerHTML = `
    <div class="card">
      <h3>🎉 بدء قيف اواي جديدة</h3>
      <label>القناة</label>
      <select id="gaChannel">${channelOptions()}</select>
      <label>الجائزة</label>
      <input id="gaPrize" placeholder="مثال: نيترو شهر">
      <div class="row">
        <div>
          <label>المدة</label>
          <div class="row">
            <input id="gaDurationValue" type="number" min="1" value="10" style="flex:1;">
            <select id="gaDurationUnit" style="flex:1;">
              <option value="60000">دقيقة</option>
              <option value="3600000">ساعة</option>
              <option value="86400000">يوم</option>
            </select>
          </div>
        </div>
        <div>
          <label>عدد الفائزين</label>
          <input id="gaWinners" type="number" min="1" value="1">
        </div>
      </div>
      <button onclick="startGiveawayNow()">🎉 بدء القيف اواي</button>
    </div>

    <div class="card">
      <h3>📋 القيف اواي الحالية</h3>
      ${giveaways.length === 0 ? '<div class="empty-state">ما فيه قيف اواي</div>' : `
        <table><tr><th>الجائزة</th><th>الفائزين</th><th>الحالة</th><th></th></tr>
        ${giveaways.map(g => `
          <tr>
            <td>${g.prize}</td>
            <td>${g.winners_count}</td>
            <td>${g.ended ? 'انتهت' : 'نشطة'}</td>
            <td>${!g.ended ? `<button class="danger" onclick="endGiveawayNow(${g.id})">إنهاء الآن</button>` : ''}</td>
          </tr>
        `).join('')}
        </table>
      `}
    </div>
  `;
}

async function startGiveawayNow() {
  const channelId = document.getElementById('gaChannel').value;
  const prize = document.getElementById('gaPrize').value.trim();
  const durationValue = parseInt(document.getElementById('gaDurationValue').value);
  const durationUnit = parseInt(document.getElementById('gaDurationUnit').value);
  const winnersCount = parseInt(document.getElementById('gaWinners').value) || 1;

  if (!channelId || !prize || !durationValue) return toast('عبي كل الحقول', true);

  try {
    await api(`/api/guild/${guildId}/giveaways/start`, {
      method: 'POST',
      body: JSON.stringify({ channelId, prize, durationMs: durationValue * durationUnit, winnersCount }),
    });
    toast('تم بدء القيف اواي ✅');
    switchTab('giveaways');
  } catch (err) {
    toast(err.message, true);
  }
}

async function endGiveawayNow(id) {
  await api(`/api/guild/${guildId}/giveaways/${id}/end`, { method: 'POST' });
  toast('تم إنهاء القيف اواي ✅');
  switchTab('giveaways');
}

// ---------------- الأدوات (ايمبد / قول) ----------------
async function renderTools(content) {
  content.innerHTML = `
    <div class="card">
      <h3>🖼️ بناء ايمبد وإرساله</h3>
      <label>القناة</label>
      <select id="embedChannel">${channelOptions()}</select>
      <label>العنوان</label>
      <input id="embedTitle">
      <label>الوصف</label>
      <textarea id="embedDescription" rows="3"></textarea>
      <div class="row">
        <div><label>اللون</label><input id="embedColor" value="#5865F2"></div>
        <div><label>رابط صورة</label><input id="embedImage"></div>
      </div>
      <label>الفوتر</label>
      <input id="embedFooter">
      <button onclick="sendEmbed()">إرسال</button>
    </div>

    <div class="card">
      <h3>💬 قول (Say)</h3>
      <label>القناة</label>
      <select id="sayChannel">${channelOptions()}</select>
      <label>النص</label>
      <textarea id="sayText" rows="2"></textarea>
      <button onclick="sendSay()">إرسال</button>
    </div>
  `;
}

async function sendEmbed() {
  const channelId = document.getElementById('embedChannel').value;
  if (!channelId) return toast('اختر قناة', true);
  await api(`/api/guild/${guildId}/embed/send`, {
    method: 'POST',
    body: JSON.stringify({
      channelId,
      title: document.getElementById('embedTitle').value,
      description: document.getElementById('embedDescription').value,
      color: document.getElementById('embedColor').value,
      image: document.getElementById('embedImage').value,
      footer: document.getElementById('embedFooter').value,
    }),
  });
  toast('تم الإرسال ✅');
}

async function sendSay() {
  const channelId = document.getElementById('sayChannel').value;
  const text = document.getElementById('sayText').value.trim();
  if (!channelId || !text) return toast('حط قناة ونص', true);
  await api(`/api/guild/${guildId}/say`, { method: 'POST', body: JSON.stringify({ channelId, text }) });
  toast('تم الإرسال ✅');
}

// ---------------- إرسال للجميع (خاص جماعي) ----------------
async function renderBroadcast(content) {
  content.innerHTML = `
    <div class="card">
      <h3>📢 إرسال رسالة خاصة لأعضاء السيرفر</h3>
      <p style="color:var(--text-muted); font-size:13px;">يرسل رسالة خاصة (DM) لكل عضو حسب الفئة اللي تختارها. الأعضاء اللي مقفلين الخاص أو حاظرين البوت بيفشل الإرسال لهم تلقائياً وبيتم تجاوزهم.</p>
      <label>العنوان (اختياري)</label>
      <input id="bcTitle">
      <label>الرسالة</label>
      <textarea id="bcMessage" rows="4"></textarea>
      <div class="row" style="margin-top:14px;">
        <button onclick="sendBroadcastDm('all')">📨 إرسال للجميع</button>
        <button onclick="sendBroadcastDm('online')">🟢 إرسال للأونلاين فقط</button>
        <button class="secondary" onclick="sendBroadcastDm('offline')">⚪ إرسال للأوفلاين فقط</button>
      </div>
      <div id="bcResult" style="margin-top:14px;"></div>
    </div>
  `;
}

async function sendBroadcastDm(target) {
  const title = document.getElementById('bcTitle').value.trim();
  const message = document.getElementById('bcMessage').value.trim();
  if (!message) return toast('اكتب رسالة', true);

  const resultEl = document.getElementById('bcResult');
  resultEl.innerHTML = '<div class="empty-state">جاري الإرسال... قد تاخذ وقت حسب عدد الأعضاء</div>';

  try {
    const result = await api(`/api/guild/${guildId}/broadcast-dm`, {
      method: 'POST',
      body: JSON.stringify({ title, message, target }),
    });
    resultEl.innerHTML = `<div class="success-msg">تم الإرسال ✅ — نجح: ${result.sent} | فشل: ${result.failed} | الإجمالي المستهدف: ${result.total}</div>`;
    toast('انتهى الإرسال ✅');
  } catch (err) {
    resultEl.innerHTML = `<div class="error-msg">${err.message}</div>`;
  }
}

// ---------------- تهيئة الصفحة ----------------
async function init() {
  const overview = await api(`/api/guild/${guildId}/overview`);
  document.getElementById('guildName').textContent = overview.name;
  if (overview.icon) document.getElementById('guildIcon').src = overview.icon;

  CHANNELS = await api(`/api/guild/${guildId}/channels`);
  ROLES = await api(`/api/guild/${guildId}/roles`);

  switchTab('overview');
}

init();
