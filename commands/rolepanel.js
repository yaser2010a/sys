const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');
const { CATEGORIES } = require('../utils/selfRoles');
const { hasCommandAccess } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolepanel')
    .setDescription('نشر لوحة الرتب'),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'rolepanel', m => m.permissions.has(PermissionFlagsBits.ManageGuild))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

  
    const embed = new EmbedBuilder()
      .setTitle('🎭 رتب السيرفر')
      .setDescription('اختر القسم الذي تريده من القائمة بالأسفل')
      .setColor('#5865F2')
      .setImage('https://cdn.discordapp.com/attachments/1498718919253430333/1514707782392090684/roles.png?ex=6a4d4e8d&is=6a4bfd0d&hm=79fdc923a2b4ebaceb8a85e86ad39cf0efb1e18181c19ba769b8734a7021e94c&');

    const menu = new StringSelectMenuBuilder()
      .setCustomId('role_category_select')
      .setPlaceholder('اختر قسم الرتب')
      .addOptions(
        Object.entries(CATEGORIES).map(([key, label]) => ({ label, value: key }))
      );

    const row = new ActionRowBuilder().addComponents(menu);

   
    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: 'تم نشر لوحة الرتب ✅', ephemeral: true });
  },
};