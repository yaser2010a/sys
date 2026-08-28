const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { db } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('عرض أفضل الأعضاء بالمستويات')
    .addStringOption(o =>
      o.setName('النوع').setDescription('كتابي أو صوتي').setRequired(true)
        .addChoices({ name: 'كتابي', value: 'text' }, { name: 'صوتي', value: 'voice' })
    ),

  async execute(interaction) {
    const type = interaction.options.getString('النوع');
    const table = type === 'text' ? 'text_levels' : 'voice_levels';

    const rows = db.prepare(`SELECT * FROM ${table} WHERE guild_id = ? ORDER BY level DESC, xp DESC LIMIT 10`)
      .all(interaction.guild.id);

    if (rows.length === 0) return interaction.reply('ما فيه بيانات كافية بعد');

    const lines = rows.map((r, i) => `**${i + 1}.** <@${r.user_id}> — المستوى ${r.level} (${r.xp} XP)`);

    const embed = new EmbedBuilder()
      .setTitle(`🏆 توب 10 - ${type === 'text' ? 'كتابي' : 'صوتي'}`)
      .setDescription(lines.join('\n'))
      .setColor('#F1C40F');

    await interaction.reply({ embeds: [embed] });
  },
};
