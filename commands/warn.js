const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { db } = require('../utils/database');
const { logModAction } = require('../utils/logger');
const { hasCommandAccess } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('تحذير عضو')
    .addUserOption(o => o.setName('العضو').setDescription('العضو المراد تحذيره').setRequired(true))
    .addStringOption(o => o.setName('السبب').setDescription('سبب التحذير').setRequired(true)),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'وارن', m => m.permissions.has(PermissionFlagsBits.ModerateMembers))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const target = interaction.options.getUser('العضو');
    const reason = interaction.options.getString('السبب');

    db.prepare('INSERT INTO warnings (guild_id, user_id, moderator_id, reason, timestamp) VALUES (?, ?, ?, ?, ?)')
      .run(interaction.guild.id, target.id, interaction.user.id, reason, Date.now());

    const dmEmbed = new EmbedBuilder()
      .setTitle('⚠️ تم تحذيرك')
      .setDescription(`تم تحذيرك في سيرفر **${interaction.guild.name}**`)
      .addFields({ name: 'السبب', value: reason })
      .setColor('#FEE75C');
    await target.send({ embeds: [dmEmbed] }).catch(() => {});

    logModAction(interaction.guild, { type: 'warn', action: 'تحذير', target: `<@${target.id}>`, moderator: `<@${interaction.user.id}>`, reason });
    await interaction.reply(`تم تحذير **${target.tag}** ⚠️`);
  },
};
