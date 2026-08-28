const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { CATEGORIES } = require('../utils/commandCategories');

function buildHomeEmbed(client) {
  return new EmbedBuilder()
    .setTitle('help')
    .setDescription('اختر تصنيف من القائمة تحت عشان تشوف أوامره.')
    .setColor('#5865F2')
    .setThumbnail(client.user.displayAvatarURL())
    .addFields(
      Object.values(CATEGORIES).map(cat => ({ name: cat.label, value: cat.description, inline: true }))
    );
}

function buildCategoryEmbed(key) {
  const cat = CATEGORIES[key];
  return new EmbedBuilder()
    .setTitle(cat.label)
    .setDescription(cat.commands.map(c => `**${c.name}**\n${c.desc}`).join('\n\n'))
    .setColor('#5865F2');
}

function buildSelectRow(selected) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('help_select')
    .setPlaceholder('اختر تصنيف الأوامر...')
    .addOptions(
      Object.entries(CATEGORIES).map(([key, cat]) => ({
        label: cat.label,
        description: cat.description,
        value: key,
        default: key === selected,
      }))
    );
  return new ActionRowBuilder().addComponents(menu);
}

module.exports = {
  data: new SlashCommandBuilder().setName('هيلب').setDescription('عرض كل أوامر البوت مبوبة'),

  async execute(interaction) {
    const embed = buildHomeEmbed(interaction.client);
    const row = buildSelectRow(null);
    await interaction.reply({ embeds: [embed], components: [row] });
  },

  buildCategoryEmbed,
  buildSelectRow,
};
