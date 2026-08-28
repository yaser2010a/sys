const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data');

// قوانين السيرفر بتنقرا من data/text2.txt
// قوانين الإدارة بتنقرا من data/text1.txt
const FILES = {
  server: { filename: 'text2.txt', label: 'قوانين السيرفر' },
  admin: { filename: 'text1.txt', label: 'قوانين الإدارة' },
};

function readRulesFile(key) {
  const entry = FILES[key];
  if (!entry) return null;

  const filePath = path.join(DATA_PATH, entry.filename);
  if (!fs.existsSync(filePath)) {
    return { label: entry.label, content: 'ما فيه محتوى مضاف بعد بهذا الملف.' };
  }

  const content = fs.readFileSync(filePath, 'utf8').trim();
  return { label: entry.label, content: content || 'الملف فاضي حالياً.' };
}

function writeRulesFile(key, content) {
  const entry = FILES[key];
  if (!entry) return false;
  fs.writeFileSync(path.join(DATA_PATH, entry.filename), content, 'utf8');
  return true;
}

function listRuleKeys() {
  return Object.entries(FILES).map(([key, v]) => ({ key, label: v.label }));
}

module.exports = { readRulesFile, writeRulesFile, listRuleKeys, FILES };
