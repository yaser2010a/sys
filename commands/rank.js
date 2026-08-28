const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { db } = require('../utils/database');
const { xpForLevel } = require('../utils/leveling');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('عرض مستواك بالكتابة والصوت')
    .addUserOption(o => o.setName('العضو').setDescription('العضو (اختياري)').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getUser('العضو') || interaction.user;

    const text = db.prepare('SELECT * FROM text_levels WHERE guild_id = ? AND user_id = ?')
      .get(interaction.guild.id, target.id) || { xp: 0, level: 0 };
    const voice = db.prepare('SELECT * FROM voice_levels WHERE guild_id = ? AND user_id = ?')
      .get(interaction.guild.id, target.id) || { xp: 0, level: 0 };

    const embed = new EmbedBuilder()
      .setTitle(`📊 مستوى ${target.tag}`)
      .setThumbnail(target.displayAvatarURL())
      .setColor('#5865F2')
      .addFields(
        { name: '💬 الكتابة', value: `المستوى **${text.level}** (${text.xp}/${xpForLevel(text.level)} XP)`, inline: false },
        { name: '🎙️ الصوت', value: `المستوى **${voice.level}** (${voice.xp}/${xpForLevel(voice.level)} XP)`, inline: false }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
