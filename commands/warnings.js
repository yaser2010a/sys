const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { db } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('عرض تحذيرات عضو')
    .addUserOption(o => o.setName('العضو').setDescription('العضو').setRequired(true)),

  async execute(interaction) {
    const target = interaction.options.getUser('العضو');
    const rows = db.prepare('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY timestamp DESC')
      .all(interaction.guild.id, target.id);

    if (rows.length === 0) {
      return interaction.reply(`العضو **${target.tag}** ما عليه أي تحذيرات ✅`);
    }

    const embed = new EmbedBuilder()
      .setTitle(`⚠️ تحذيرات ${target.tag}`)
      .setColor('#FEE75C')
      .setDescription(
        rows.map((r, i) => `**${i + 1}.** ${r.reason}\nبواسطة <@${r.moderator_id}> — <t:${Math.floor(r.timestamp / 1000)}:R>`).join('\n\n')
      );

    await interaction.reply({ embeds: [embed] });
  },
};
