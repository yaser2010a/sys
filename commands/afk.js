const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { db } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('تفعيل وضع الافك (بعيد عن الجهاز)')
    .addStringOption(o => o.setName('السبب').setDescription('سبب الافك').setRequired(false)),

  async execute(interaction) {
    const reason = interaction.options.getString('السبب') || 'بدون سبب';

    db.prepare('INSERT OR REPLACE INTO afk_users (guild_id, user_id, reason, timestamp) VALUES (?, ?, ?, ?)')
      .run(interaction.guild.id, interaction.user.id, reason, Date.now());

    const embed = new EmbedBuilder()
      .setDescription(`💤 ${interaction.user} صار افك: ${reason}`)
      .setColor('#95A5A6');

    await interaction.reply({ embeds: [embed] });
  },
};
