const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { muteMember } = require('../utils/moderation');
const { hasCommandAccess } = require('../utils/permissions');

const UNITS = { 'د': 60000, 'س': 3600000, 'ي': 86400000 };

function parseDuration(input) {
  const match = input.match(/^(\d+)(د|س|ي)$/);
  if (!match) return null;
  return parseInt(match[1]) * UNITS[match[2]];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription("اعطي عضو تايما اوت")
    .addUserOption(o => o.setName('العضو').setDescription('العضو المراد كتمه').setRequired(true))
    .addStringOption(o => o.setName('المدة').setDescription('مثال: 10د / 2س / 1ي').setRequired(true))
    .addStringOption(o => o.setName('السبب').setDescription('سبب الكتم').setRequired(false)),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'تايم', m => m.permissions.has(PermissionFlagsBits.ModerateMembers))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const target = interaction.options.getMember('العضو');
    const durationInput = interaction.options.getString('المدة');
    const reason = interaction.options.getString('السبب');

    const durationMs = parseDuration(durationInput);
    if (!durationMs || durationMs > 2419200000) {
      return interaction.reply({ content: 'صيغة المدة غير صحيحة. استخدم مثل: 10د أو 2س أو 1ي (أقصى مدة 28 يوم)', ephemeral: true });
    }

    if (!target.moderatable) {
      return interaction.reply({ content: 'ما أقدر أكتم هذا العضو (صلاحياته أعلى أو مساوية لي)', ephemeral: true });
    }

    await muteMember({ guild: interaction.guild, target, moderator: interaction.user, reason, durationMs });
    await interaction.reply(`تم كتم **${target.user.tag}** لمدة ${durationInput} ✅`);
  },
};
