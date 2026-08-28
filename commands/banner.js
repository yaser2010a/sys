const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription('عرض بنر عضو')
    .addUserOption(o => o.setName('العضو').setDescription('العضو (اختياري)').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getUser('العضو') || interaction.user;
    const fetched = await interaction.client.users.fetch(target.id, { force: true });

    if (!fetched.bannerURL()) {
      return interaction.reply({ content: 'هذا العضو ما عنده بنر 😕', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(`بنر ${target.tag}`)
      .setImage(fetched.bannerURL({ size: 1024 }))
      .setColor('#5865F2');
    await interaction.reply({ embeds: [embed] });
  },
};
