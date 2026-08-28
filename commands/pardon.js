const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isJailer, unjailMember, isCurrentlyJailed } = require('../utils/jail');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('paradon')
    .setDescription('العفو عن عضو مسجون (يطلع من السجن بدون إرجاع رتبه السابقة)')
    .addUserOption(o => o.setName('العضو').setDescription('العضو المراد العفو عنه').setRequired(true))
    .addStringOption(o => o.setName('السبب').setDescription('السبب').setRequired(false)),

  async execute(interaction) {
    if (!isJailer(interaction.member)) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم أوامر السجن', ephemeral: true });
    }

    const member = interaction.options.getMember('العضو');
    const reason = interaction.options.getString('السبب');

    if (!member) return interaction.reply({ content: 'ما لقيت هذا العضو بالسيرفر', ephemeral: true });
    if (!isCurrentlyJailed(interaction.guild.id, member.id)) {
      return interaction.reply({ content: 'هذا العضو مو مسجون', ephemeral: true });
    }

    try {
      await unjailMember({ guild: interaction.guild, member, moderator: interaction.user, reason, restorePreviousRoles: false });
      await interaction.reply(`تم العفو عن **${member.user.tag}** وإخراجه من السجن 🕊️`);
    } catch (err) {
      await interaction.reply({ content: 'صار خطأ، تأكد إن رتبة السجن محددة', ephemeral: true });
    }
  },
};
