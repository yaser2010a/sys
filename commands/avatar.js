const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('عرض صورة عضو')
    .addUserOption(o => o.setName('العضو').setDescription('العضو (اختياري)').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getUser('العضو') || interaction.user;
    const embed = new EmbedBuilder()
      .setTitle(`صورة ${target.tag}`)
      .setImage(target.displayAvatarURL({ size: 1024 }))
      .setColor('#5865F2');
    await interaction.reply({ embeds: [embed] });
  },
};
