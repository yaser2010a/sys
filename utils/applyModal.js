const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

function buildApplyModal() {
  const modal = new ModalBuilder().setCustomId('apply_modal').setTitle('تقديم إدارة');

  const age = new TextInputBuilder().setCustomId('age').setLabel('عمرك؟').setStyle(TextInputStyle.Short).setRequired(true);
  const experience = new TextInputBuilder().setCustomId('experience').setLabel('عندك خبرة إدارة سابقة؟').setStyle(TextInputStyle.Paragraph).setRequired(true);
  const reason = new TextInputBuilder().setCustomId('reason').setLabel('ليش تستاهل المنصب؟').setStyle(TextInputStyle.Paragraph).setRequired(true);
  const hours = new TextInputBuilder().setCustomId('hours').setLabel('كم ساعة تقدر تتواجد يومياً؟').setStyle(TextInputStyle.Short).setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(age),
    new ActionRowBuilder().addComponents(experience),
    new ActionRowBuilder().addComponents(reason),
    new ActionRowBuilder().addComponents(hours)
  );

  return modal;
}

module.exports = { buildApplyModal };
