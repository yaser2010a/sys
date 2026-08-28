const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { listRuleKeys } = require('../utils/rules');
const { hasCommandAccess } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('نشر لوحة القوانين التفاعلية (قوانين السيرفر / قوانين الإدارة)'),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'قوانين', m => m.permissions.has(PermissionFlagsBits.ManageGuild))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('📋 قائمة القوانين')
      .setDescription('اختر نوع القوانين من القائمة بالأسفل')
      .setImage("https://cdn.discordapp.com/attachments/1498718919253430333/1514707529769160965/rules.png?ex=6a4d4e51&is=6a4bfcd1&hm=c8c8165b84cacd8f35bd12fa80eb255edc5a7ccec13d06c9b3d660b2740f9d1c&")
      .setColor('#f3f4f8');

    const menu = new StringSelectMenuBuilder()
      .setCustomId('rules_select')
      .setPlaceholder('اختر نوع القوانين')
      .addOptions(listRuleKeys().map(r => ({ label: r.label, value: r.key })));

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: 'تم نشر لوحة القوانين ✅', ephemeral: true });
  },
};
